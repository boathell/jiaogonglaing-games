/**
 * UI管理器类
 * 负责管理游戏界面和用户交互
 */
class UIManager {
    /**
     * 构造函数
     */
    constructor() {
        this.eventBus = null;
        this.gameEngine = null;
        this.cardWidth = 80;
        this.cardHeight = 120;
        this.cardGap = 20;
        this.selectedCards = [];
        
        // DOM元素
        this.gameContainer = document.getElementById('game-container');
        this.playerAreas = {
            '0': document.getElementById('player-0'),
            '1': document.getElementById('player-1'),
            '2': document.getElementById('player-2')
        };
        this.lastPlay = document.getElementById('last-play');
        this.gameStatus = document.getElementById('game-status');
        this.playerCards = document.getElementById('player-cards');
        this.playButton = document.getElementById('play-btn');
        this.passButton = document.getElementById('pass-btn');
        this.newGameButton = document.getElementById('new-game-btn');
        this.helpButton = document.getElementById('help-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameResult = document.getElementById('game-result');
        this.tributeInfo = document.getElementById('tribute-info');
        this.nextRoundButton = document.getElementById('next-round-btn');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelpButton = document.querySelector('.close-btn');
    }

    /**
     * 初始化UI管理器
     * @param {GameEngine} gameEngine - 游戏引擎
     * @param {EventBus} eventBus - 事件总线
     */
    init(gameEngine, eventBus) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        
        // 绑定事件
        this.bindEvents();
        
        // 订阅事件
        this.subscribeToEvents();
    }

    /**
     * 绑定DOM事件
     */
    bindEvents() {
        // 出牌按钮
        this.playButton.addEventListener('click', () => {
            const currentPlayer = this.gameEngine.gameState.getCurrentPlayer();
            if (currentPlayer.isHuman) {
                const selectedCards = currentPlayer.getSelectedCards();
                if (selectedCards.length > 0) {
                    this.eventBus.emit('play-cards', {
                        player: currentPlayer,
                        cards: selectedCards
                    });
                }
            }
        });
        
        // 不出按钮
        this.passButton.addEventListener('click', () => {
            const currentPlayer = this.gameEngine.gameState.getCurrentPlayer();
            if (currentPlayer.isHuman) {
                this.eventBus.emit('pass', {
                    player: currentPlayer
                });
            }
        });
        
        // 新游戏按钮
        this.newGameButton.addEventListener('click', () => {
            this.eventBus.emit('new-game');
        });
        
        // 下一局按钮
        this.nextRoundButton.addEventListener('click', () => {
            this.hideGameOverModal();
            this.eventBus.emit('next-round');
        });
        
        // 帮助按钮
        this.helpButton.addEventListener('click', () => {
            this.showHelpModal();
        });
        
        // 关闭帮助按钮
        this.closeHelpButton.addEventListener('click', () => {
            this.hideHelpModal();
        });
    }

    /**
     * 订阅事件
     */
    subscribeToEvents() {
        this.eventBus.on('new-game', () => {
            console.log('收到新游戏事件');
            this.eventBus.emit('game-started', {
                players: this.gameEngine.gameState.players,
                currentPlayerIndex: this.gameEngine.gameState.currentPlayerIndex
            });
        });
        this.eventBus.on('game-started', this.handleGameStarted.bind(this));
        this.eventBus.on('round-started', this.handleRoundStarted.bind(this));
        this.eventBus.on('cards-played', this.handleCardsPlayed.bind(this));
        this.eventBus.on('player-passed', this.handlePlayerPassed.bind(this));
        this.eventBus.on('turn-changed', this.handleTurnChanged.bind(this));
        this.eventBus.on('game-over', this.handleGameOver.bind(this));
        this.eventBus.on('tribute-completed', this.handleTributeCompleted.bind(this));
        this.eventBus.on('invalid-play', this.handleInvalidPlay.bind(this));
    }

    /**
     * 处理游戏开始事件
     * @param {Object} data - 游戏开始数据
     */
    handleGameStarted(data) {
        const { players, currentPlayerIndex } = data;
        
        // 清空所有区域
        this.clearAllAreas();
        
        // 隐藏"等待游戏开始"提示
        document.getElementById('game-status').textContent = '';
        
        // 渲染玩家手牌
        for (const player of players) {
            this.renderPlayerCards(player);
            this.updateCardCount(player);
        }
        
        // 高亮当前玩家
        this.highlightCurrentPlayer(currentPlayerIndex);
        
        // 更新按钮状态
        this.updateButtonStatus();
    }

    /**
     * 处理回合开始事件
     * @param {Object} data - 回合开始数据
     */
    handleRoundStarted(data) {
        const { players, currentPlayerIndex } = data;
        
        // 清空所有区域
        this.clearAllAreas();
        
        // 渲染玩家手牌
        for (const player of players) {
            this.renderPlayerCards(player);
            this.updateCardCount(player);
        }
        
        // 高亮当前玩家
        this.highlightCurrentPlayer(currentPlayerIndex);
        
        // 更新按钮状态
        this.updateButtonStatus();
    }

    /**
     * 处理出牌事件
     * @param {Object} data - 出牌数据
     */
    handleCardsPlayed(data) {
        const { player, cards, remainingCards } = data;
        
        // 渲染出牌区域
        this.renderPlayArea(player.id, cards);
        
        // 更新玩家手牌
        this.renderPlayerCards(player);
        
        // 更新卡牌数量
        this.updateCardCount(player);
        
        // 更新按钮状态
        this.updateButtonStatus();
    }

    /**
     * 处理不出事件
     * @param {Object} data - 不出数据
     */
    handlePlayerPassed(data) {
        const { player } = data;
        
        // 显示不出的提示
        this.showPassIndicator(player.id);
        
        // 更新按钮状态
        this.updateButtonStatus();
    }

    /**
     * 处理回合切换事件
     * @param {Object} data - 回合切换数据
     */
    handleTurnChanged(data) {
        const { currentPlayerIndex } = data;
        
        // 高亮当前玩家
        this.highlightCurrentPlayer(currentPlayerIndex);
        
        // 更新按钮状态
        this.updateButtonStatus();
    }

    /**
     * 处理游戏结束事件
     * @param {Object} data - 游戏结束数据
     */
    handleGameOver(data) {
        const { winner, loser, needTribute } = data;
        
        let message = '';
        
        if (winner.isHuman) {
            message = '恭喜你赢了！';
        } else {
            message = `${winner.name}赢了！`;
        }
        
        if (needTribute) {
            message += `${loser.name}需要交公粮。`;
        }
        
        this.gameOverMessage.textContent = message;
        this.showGameOverModal();
    }

    /**
     * 处理交粮完成事件
     * @param {Object} data - 交粮数据
     */
    handleTributeCompleted(data) {
        const { winner, loser, tributeCard, returnCard } = data;
        
        // 更新玩家手牌
        this.renderPlayerCards(winner);
        this.renderPlayerCards(loser);
        
        // 更新卡牌数量
        this.updateCardCount(winner);
        this.updateCardCount(loser);
    }

    /**
     * 处理无效出牌事件
     * @param {Object} data - 无效出牌数据
     */
    handleInvalidPlay(data) {
        alert('无效的出牌！');
    }

    /**
     * 渲染玩家手牌
     * @param {Player} player - 玩家
     */
    renderPlayerCards(player) {
        const playerArea = this.playerAreas[player.id];
        
        // 清空玩家区域
        playerArea.innerHTML = '';
        
        // 排序手牌
        player.sortCards();
        
        // 渲染手牌
        for (let i = 0; i < player.cards.length; i++) {
            const card = player.cards[i];
            const cardElement = this.createCardElement(card);
            
            // 设置卡牌位置
            // const offsetX = i * (this.cardWidth + 5);
            // cardElement.style.left = `${offsetX}px`;
            
            // 如果是人类玩家，添加点击事件
            if (player.isHuman) {
                cardElement.addEventListener('click', () => {
                    this.handleCardClick(card, cardElement);
                });
                
                // 如果卡牌被选中，添加选中样式
                if (card.selected) {
                    cardElement.classList.add('selected');
                }
            } else {
                // 如果不是人类玩家，卡牌背面朝上
                cardElement.classList.add('card-back');
            }
            
            playerArea.appendChild(cardElement);
        }
    }

    /**
     * 渲染出牌区域
     * @param {string} playerId - 玩家ID
     * @param {Card[]} cards - 出的牌
     */
    renderPlayArea(playerId, cards) {
        const playArea = this.playAreas[playerId];
        
        // 清空出牌区域
        playArea.innerHTML = '';
        
        // 渲染出的牌
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardElement = this.createCardElement(card);
            
            // 设置卡牌位置
            // const offsetX = i * (this.cardWidth + 5);
            // cardElement.style.left = `${offsetX}px`;
            
            playArea.appendChild(cardElement);
        }
    }

    /**
     * 创建卡牌元素
     * @param {Card} card - 卡牌
     * @returns {HTMLElement} - 卡牌元素
     */
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.suit = card.suit;
        cardElement.dataset.rank = card.rank;
        
        // 添加花色和点数
        const suitElement = document.createElement('div');
        suitElement.className = 'card-suit';
        suitElement.textContent = this.getSuitSymbol(card.suit);
        
        const rankElement = document.createElement('div');
        rankElement.className = 'card-rank';
        rankElement.textContent = this.getRankText(card.rank);
        
        cardElement.appendChild(suitElement);
        cardElement.appendChild(rankElement);
        
        return cardElement;
    }

    /**
     * 获取花色符号
     * @param {string} suit - 花色
     * @returns {string} - 花色符号
     */
    getSuitSymbol(suit) {
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    }

    /**
     * 获取点数文本
     * @param {string} rank - 点数
     * @returns {string} - 点数文本
     */
    getRankText(rank) {
        switch (rank) {
            case '1': return 'A';
            case '11': return 'J';
            case '12': return 'Q';
            case '13': return 'K';
            default: return rank;
        }
    }

    /**
     * 处理卡牌点击事件
     * @param {Card} card - 卡牌
     * @param {HTMLElement} cardElement - 卡牌元素
     */
    handleCardClick(card, cardElement) {
        // 切换卡牌选中状态
        card.selected = !card.selected;
        
        if (card.selected) {
            cardElement.classList.add('selected');
        } else {
            cardElement.classList.remove('selected');
        }
    }

    /**
     * 显示不出的提示
     * @param {string} playerId - 玩家ID
     */
    showPassIndicator(playerId) {
        const playArea = this.playAreas[playerId];
        
        // 清空出牌区域
        playArea.innerHTML = '';
        
        // 创建不出提示
        const passElement = document.createElement('div');
        passElement.className = 'pass-indicator';
        passElement.textContent = '不出';
        
        playArea.appendChild(passElement);
    }

    /**
     * 高亮当前玩家
     * @param {number} currentPlayerIndex - 当前玩家索引
     */
    highlightCurrentPlayer(currentPlayerIndex) {
        // 移除所有高亮
        for (const id in this.playerAreas) {
            this.playerAreas[id].classList.remove('current-player');
        }
        
        // 高亮当前玩家
        const currentPlayerId = currentPlayerIndex.toString();
        this.playerAreas[currentPlayerId].classList.add('current-player');
    }

    /**
     * 更新卡牌数量
     * @param {Player} player - 玩家
     */
    updateCardCount(player) {
        const cardCountElement = this.cardCountElements[player.id];
        cardCountElement.textContent = `剩余: ${player.cards.length}`;
    }

    /**
     * 更新按钮状态
     */
    updateButtonStatus() {
        const currentPlayer = this.gameEngine.gameState.getCurrentPlayer();
        const gameState = this.gameEngine.gameState;
        
        // 如果当前玩家是人类玩家且游戏阶段是PLAYING
        if (currentPlayer.isHuman && gameState.phase === 'PLAYING') {
            this.playButton.disabled = false;
            
            // 如果有上一次有效出牌，则可以不出
            this.passButton.disabled = !gameState.lastValidPlay;
        } else {
            this.playButton.disabled = true;
            this.passButton.disabled = true;
        }
    }

    /**
     * 清空所有区域
     */
    clearAllAreas() {
        // 清空玩家区域
        for (const id in this.playerAreas) {
            this.playerAreas[id].innerHTML = '';
        }
        
        // 清空出牌区域
        for (const id in this.playAreas) {
            this.playAreas[id].innerHTML = '';
        }
    }

    /**
     * 显示游戏结束弹窗
     */
    showGameOverModal() {
        this.gameOverModal.style.display = 'flex';
    }

    /**
     * 隐藏游戏结束弹窗
     */
    hideGameOverModal() {
        this.gameOverModal.style.display = 'none';
    }

    /**
     * 显示帮助弹窗
     */
    showHelpModal() {
        this.helpModal.style.display = 'flex';
    }

    /**
     * 隐藏帮助弹窗
     */
    hideHelpModal() {
        this.helpModal.style.display = 'none';
    }
}