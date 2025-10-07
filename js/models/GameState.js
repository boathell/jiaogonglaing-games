/**
 * 游戏状态类
 * 管理游戏的当前状态
 */
class GameState {
    /**
     * 构造函数
     */
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.phase = 'INIT'; // INIT, PLAYING, GAME_OVER, TRIBUTE
        this.round = 0;
        this.lastValidPlay = null;
        this.lastValidPlayIndex = -1;
        this.passCount = 0;
        this.winner = null;
        this.loser = null;
        this.needTribute = false;
    }

    /**
     * 初始化玩家
     * @param {Player[]} players - 玩家数组
     */
    initPlayers(players) {
        this.players = players;
    }

    /**
     * 获取当前玩家
     * @returns {Player} - 当前玩家
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * 切换到下一个玩家
     */
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    /**
     * 记录有效出牌
     * @param {Card[]} cards - 出的牌
     */
    recordValidPlay(cards) {
        this.lastValidPlay = cards;
        this.lastValidPlayIndex = this.currentPlayerIndex;
        this.passCount = 0;
    }

    /**
     * 记录不出
     */
    recordPass() {
        this.passCount++;
    }

    /**
     * 重置出牌记录
     */
    resetPlayRecord() {
        this.lastValidPlay = null;
        this.lastValidPlayIndex = -1;
        this.passCount = 0;
    }

    /**
     * 检查是否所有玩家都不出
     * @returns {boolean} - 是否所有其他玩家都不出
     */
    isAllPlayersPassed() {
        return this.passCount >= this.players.length - 1;
    }

    /**
     * 检查游戏是否结束
     * @returns {boolean} - 游戏是否结束
     */
    checkGameEnd() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].cards.length === 0) {
                this.winner = this.players[i];
                this.phase = 'GAME_OVER';
                
                // 找出输家（剩余牌最多的玩家）
                let maxCards = -1;
                let loserIndex = -1;
                
                for (let j = 0; j < this.players.length; j++) {
                    if (j !== i && this.players[j].cards.length > maxCards) {
                        maxCards = this.players[j].cards.length;
                        loserIndex = j;
                    }
                }
                
                if (loserIndex !== -1) {
                    this.loser = this.players[loserIndex];
                    this.checkNeedTribute();
                }
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * 检查是否需要交粮
     */
    checkNeedTribute() {
        if (!this.loser) return;
        
        // 检查是否有四张相同点数的牌
        const fours = this.loser.getFours();
        if (fours.length > 0) {
            this.needTribute = false;
            return;
        }
        
        // 检查是否有大小王
        const hasJokers = this.loser.cards.some(card => card.suit === 'joker');
        if (hasJokers) {
            this.needTribute = false;
            return;
        }
        
        // 检查最大的牌是否是K
        const largestCard = this.loser.getLargestCard();
        if (largestCard && largestCard.rank === 'K') {
            this.needTribute = false;
            return;
        }
        
        this.needTribute = true;
    }

    /**
     * 设置游戏阶段
     * @param {string} phase - 游戏阶段
     */
    setPhase(phase) {
        this.phase = phase;
    }

    /**
     * 重置游戏状态
     */
    reset() {
        this.currentPlayerIndex = 0;
        this.phase = 'INIT';
        this.round = 0;
        this.lastValidPlay = null;
        this.lastValidPlayIndex = -1;
        this.passCount = 0;
        this.winner = null;
        this.loser = null;
        this.needTribute = false;
    }
}