/**
 * 游戏引擎类
 * 负责管理游戏流程和规则执行
 */
class GameEngine {
    /**
     * 构造函数
     */
    constructor() {
        this.gameState = new GameState();
        this.cardManager = new CardManager();
        this.uiManager = null;
        this.aiManager = null;
        this.eventBus = null;
    }

    /**
     * 初始化游戏
     * @param {UIManager} uiManager - UI管理器
     * @param {AIManager} aiManager - AI管理器
     * @param {EventBus} eventBus - 事件总线
     */
    init(uiManager, aiManager, eventBus) {
        this.uiManager = uiManager;
        this.aiManager = aiManager;
        this.eventBus = eventBus;
        
        // 初始化玩家
        const players = [
            new Player('0', '玩家', true),
            new Player('1', '电脑玩家 1', false),
            new Player('2', '电脑玩家 2', false)
        ];
        
        this.gameState.initPlayers(players);
        
        // 订阅事件
        this.eventBus.on('play-cards', this.handlePlayerPlay.bind(this));
        this.eventBus.on('pass', this.handlePlayerPass.bind(this));
        this.eventBus.on('new-game', this.startNewGame.bind(this));
        this.eventBus.on('next-round', this.startNextRound.bind(this));
    }

    /**
     * 开始新游戏
     */
    startNewGame() {
        console.log('GameEngine.startNewGame 开始');
        // 重置游戏状态
        this.gameState.reset();
        
        // 初始化卡牌
        this.cardManager.initCards();
        this.cardManager.shuffleCards();
        
        // 发牌
        this.cardManager.dealCards(this.gameState.players);
        
        // 随机决定第一个出牌的玩家
        this.gameState.currentPlayerIndex = Math.floor(Math.random() * 3);
        console.log(`随机选择的起始玩家索引: ${this.gameState.currentPlayerIndex}`);
        
        // 设置游戏阶段为PLAYING
        this.gameState.setPhase('PLAYING');
        
        // 通知UI更新
        console.log('发出game-started事件');
        this.eventBus.emit('game-started', {
            players: this.gameState.players,
            currentPlayerIndex: this.gameState.currentPlayerIndex
        });
        
        // 如果当前玩家是AI，则让AI出牌
        console.log('游戏开始，检查是否需要触发AI');
        this.checkAndTriggerAIPlay();
        
        console.log('GameEngine.startNewGame 完成');
    }

    /**
     * 开始下一局
     */
    startNextRound() {
        // 重置玩家手牌
        for (const player of this.gameState.players) {
            player.cards = [];
        }
        
        // 初始化卡牌
        this.cardManager.initCards();
        this.cardManager.shuffleCards();
        
        // 发牌
        this.cardManager.dealCards(this.gameState.players);
        
        // 如果上一局有输家，则由输家先出牌
        if (this.gameState.loser) {
            this.gameState.currentPlayerIndex = this.gameState.players.indexOf(this.gameState.loser);
        } else if (this.gameState.winner) {
            // 如果没有输家但有赢家，则由赢家先出牌
            this.gameState.currentPlayerIndex = this.gameState.players.indexOf(this.gameState.winner);
        }
        
        // 重置游戏状态
        this.gameState.setPhase('PLAYING');
        this.gameState.resetPlayRecord();
        this.gameState.winner = null;
        this.gameState.loser = null;
        this.gameState.needTribute = false;
        
        // 通知UI更新
        this.eventBus.emit('round-started', {
            players: this.gameState.players,
            currentPlayerIndex: this.gameState.currentPlayerIndex
        });
        
        // 如果当前玩家是AI，则让AI出牌
        this.checkAndTriggerAIPlay();
    }

    /**
     * 处理玩家出牌
     * @param {Object} data - 出牌数据
     * @param {Player} data.player - 出牌的玩家
     * @param {Card[]} data.cards - 出的牌
     */
    handlePlayerPlay(data) {
        console.log(`GameEngine.handlePlayerPlay 被调用 - 玩家: ${data.player.name}`);
        const { player, cards } = data;
        
        // 检查是否轮到该玩家出牌
        const currentPlayer = this.gameState.getCurrentPlayer();
        console.log(`当前玩家: ${currentPlayer.name}, 请求出牌玩家: ${player.name}`);
        if (player !== currentPlayer) {
            console.error('不是该玩家的回合');
            return;
        }
        
        // 检查出牌是否有效
        if (!this.cardManager.checkValidPlay(cards, this.gameState.lastValidPlay)) {
            console.error('无效的出牌');
            this.eventBus.emit('invalid-play', { player, cards });
            return;
        }
        
        // 移除玩家手中的牌
        if (!player.removeCards(cards)) {
            console.error('玩家没有这些牌');
            return;
        }
        
        // 记录有效出牌
        this.gameState.recordValidPlay(cards);
        
        // 通知UI更新
        this.eventBus.emit('cards-played', {
            player,
            cards,
            remainingCards: player.cards.length
        });
        
        // 检查游戏是否结束
        if (this.gameState.checkGameEnd()) {
            this.handleGameEnd();
            return;
        }
        
        // 切换到下一个玩家
        console.log(`切换到下一个玩家 - 之前玩家索引: ${this.gameState.currentPlayerIndex}`);
        this.gameState.nextPlayer();
        console.log(`切换到下一个玩家 - 之后玩家索引: ${this.gameState.currentPlayerIndex}`);
        
        // 通知UI更新当前玩家
        console.log('发出turn-changed事件');
        this.eventBus.emit('turn-changed', {
            currentPlayerIndex: this.gameState.currentPlayerIndex,
            currentPlayer: this.gameState.getCurrentPlayer()
        });
        
        // 如果当前玩家是AI，则让AI出牌
        console.log('准备调用checkAndTriggerAIPlay');
        this.checkAndTriggerAIPlay();
        
        console.log('handlePlayerPlay 方法执行完成');
    }

    /**
     * 处理玩家不出
     * @param {Object} data - 不出数据
     * @param {Player} data.player - 不出的玩家
     */
    handlePlayerPass(data) {
        console.log(`GameEngine.handlePlayerPass 被调用 - 玩家: ${data.player.name}`);
        const { player } = data;
        
        // 检查是否轮到该玩家出牌
        const currentPlayer = this.gameState.getCurrentPlayer();
        console.log(`当前玩家: ${currentPlayer.name}, 请求不出玩家: ${player.name}`);
        if (player !== currentPlayer) {
            console.error('不是该玩家的回合');
            return;
        }
        
        // 检查是否可以不出
        if (!this.gameState.lastValidPlay) {
            console.error('第一个出牌的玩家不能不出');
            return;
        }
        
        // 记录不出
        this.gameState.recordPass();
        
        // 通知UI更新
        this.eventBus.emit('player-passed', {
            player,
            passCount: this.gameState.passCount
        });
        
        // 如果所有其他玩家都不出，则由最后出牌的玩家继续出牌
        if (this.gameState.isAllPlayersPassed()) {
            this.gameState.currentPlayerIndex = this.gameState.lastValidPlayIndex;
            this.gameState.resetPlayRecord();
            
            // 通知UI更新
            this.eventBus.emit('new-round', {
                currentPlayerIndex: this.gameState.currentPlayerIndex,
                currentPlayer: this.gameState.getCurrentPlayer()
            });
        } else {
            // 切换到下一个玩家
            this.gameState.nextPlayer();
            
            // 通知UI更新当前玩家
            this.eventBus.emit('turn-changed', {
                currentPlayerIndex: this.gameState.currentPlayerIndex,
                currentPlayer: this.gameState.getCurrentPlayer()
            });
        }
        
        // 如果当前玩家是AI，则让AI出牌
        console.log('准备调用checkAndTriggerAIPlay');
        this.checkAndTriggerAIPlay();
        
        console.log('handlePlayerPass 方法执行完成');
    }

    /**
     * 处理游戏结束
     */
    handleGameEnd() {
        // 通知UI游戏结束
        this.eventBus.emit('game-over', {
            winner: this.gameState.winner,
            loser: this.gameState.loser,
            needTribute: this.gameState.needTribute
        });
        
        // 如果需要交粮，则进入交粮阶段
        if (this.gameState.needTribute) {
            this.gameState.setPhase('TRIBUTE');
            this.handleTribute();
        }
    }

    /**
     * 处理交粮
     */
    handleTribute() {
        const winner = this.gameState.winner;
        const loser = this.gameState.loser;
        
        if (!winner || !loser) {
            console.error('无法处理交粮：赢家或输家未定义');
            return;
        }
        
        // 检查输家是否有四张相同的牌
        const hasFourOfAKind = loser.cards.some(card => {
            const sameValueCards = loser.cards.filter(c => c.rank === card.rank);
            return sameValueCards.length === 4;
        });
        
        // 检查输家是否有大小王
        const hasJokers = loser.cards.some(card => 
            card.suit === 'joker'
        );
        
        if (hasFourOfAKind || hasJokers) {
            // 免交粮
            this.gameState.needTribute = false;
            
            // 通知UI更新
            this.eventBus.emit('tribute-exempted', {
                loser,
                reason: hasFourOfAKind ? '有四张相同的牌' : '有大小王'
            });
            
            return;
        }
        
        // 输家交出最大的牌
        const maxCard = loser.getLargestCard();
        if (!maxCard) {
            console.error('输家没有牌可以交');
            return;
        }
        
        loser.removeCards([maxCard]);
        winner.addCard(maxCard);
        
        // 赢家还给输家一张较小的牌
        const smallCard = winner.getSmallestCard();
        if (!smallCard) {
            console.error('赢家没有牌可以还');
            return;
        }
        
        winner.removeCards([smallCard]);
        loser.addCard(smallCard);
        
        // 对玩家手牌进行排序
        winner.sortCards();
        loser.sortCards();
        
        // 通知UI更新
        this.eventBus.emit('tribute-completed', {
            winner,
            loser,
            tributeCard: maxCard,
            returnCard: smallCard
        });
        
        // 重置交粮状态
        this.gameState.needTribute = false;
    }

    /**
     * 检查并触发AI出牌
     */
    checkAndTriggerAIPlay() {
        console.log('GameEngine.checkAndTriggerAIPlay 被调用');
        const currentPlayer = this.gameState.getCurrentPlayer();
        console.log(`当前玩家: ${currentPlayer.name}, 是否人类: ${currentPlayer.isHuman}, 游戏阶段: ${this.gameState.phase}`);
        
        if (!currentPlayer.isHuman && this.gameState.phase === 'PLAYING') {
            console.log(`触发AI玩家 ${currentPlayer.name} 出牌`);
            // 延迟一段时间，模拟AI思考
            setTimeout(() => {
                console.log(`AI玩家 ${currentPlayer.name} 开始决策...`);
                this.aiManager.makeDecision(
                    currentPlayer,
                    this.gameState,
                    this.cardManager
                );
            }, 1000);
        } else {
            console.log('不满足AI出牌条件，跳过');
        }
    }
}