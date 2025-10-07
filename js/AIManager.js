/**
 * AI管理器类
 * 负责管理AI玩家的决策逻辑
 */
class AIManager {
    /**
     * 构造函数
     */
    constructor() {
        this.eventBus = null;
    }

    /**
     * 初始化AI管理器
     * @param {EventBus} eventBus - 事件总线
     */
    init(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * 让AI做出决策
     * @param {Player} player - AI玩家
     * @param {GameState} gameState - 游戏状态
     * @param {CardManager} cardManager - 卡牌管理器
     */
    makeDecision(player, gameState, cardManager) {
        // 如果没有上一次有效出牌，则尝试出对子、三张或最小的牌
        if (!gameState.lastValidPlay) {
            // 尝试出对子或三张
            const pairs = player.getPairs();
            if (pairs.length > 0) {
                // 随机决定是否出对子
                if (Math.random() > 0.5) {
                    this.playCards(player, pairs[0]);
                    return;
                }
            }
            
            const triples = player.getTriples();
            if (triples.length > 0) {
                // 随机决定是否出三张
                if (Math.random() > 0.7) {
                    this.playCards(player, triples[0]);
                    return;
                }
            }
            
            const smallestCard = player.getSmallestCard();
            if (smallestCard) {
                this.playCards(player, [smallestCard]);
            }
            return;
        }
        
        // 尝试出比上一次有效出牌更大的牌
        const lastCards = gameState.lastValidPlay;
        const lastCardsType = cardManager.getCardsType(lastCards);
        
        // 根据上一次出牌的类型，尝试出更大的牌
        switch (lastCardsType) {
            case 'single':
                this.trySingleCard(player, gameState, cardManager);
                break;
            case 'pair':
                this.tryPairCards(player, gameState, cardManager);
                break;
            case 'triple':
                this.tryTripleCards(player, gameState, cardManager);
                break;
            default:
                // 不出
                this.pass(player);
                break;
        }
    }

    /**
     * 尝试出单张牌
     * @param {Player} player - AI玩家
     * @param {GameState} gameState - 游戏状态
     * @param {CardManager} cardManager - 卡牌管理器
     */
    trySingleCard(player, gameState, cardManager) {
        const lastCard = gameState.lastValidPlay[0];
        
        // 找出比上一张牌大的最小牌
        let cardToPlay = null;
        for (const card of player.cards) {
            if (card.value > lastCard.value) {
                if (!cardToPlay || card.value < cardToPlay.value) {
                    cardToPlay = card;
                }
            }
        }
        
        if (cardToPlay) {
            this.playCards(player, [cardToPlay]);
        } else {
            this.pass(player);
        }
    }

    /**
     * 尝试出对子
     * @param {Player} player - AI玩家
     * @param {GameState} gameState - 游戏状态
     * @param {CardManager} cardManager - 卡牌管理器
     */
    tryPairCards(player, gameState, cardManager) {
        const lastPair = gameState.lastValidPlay;
        const lastPairValue = lastPair[0].value;
        
        // 获取所有对子
        const pairs = player.getPairs();
        
        // 找出比上一对牌大的最小对子
        let pairToPlay = null;
        for (const pair of pairs) {
            if (pair[0].value > lastPairValue) {
                if (!pairToPlay || pair[0].value < pairToPlay[0].value) {
                    pairToPlay = pair;
                }
            }
        }
        
        if (pairToPlay) {
            this.playCards(player, pairToPlay);
        } else {
            this.pass(player);
        }
    }

    /**
     * 尝试出三张
     * @param {Player} player - AI玩家
     * @param {GameState} gameState - 游戏状态
     * @param {CardManager} cardManager - 卡牌管理器
     */
    tryTripleCards(player, gameState, cardManager) {
        const lastTriple = gameState.lastValidPlay;
        const lastTripleValue = lastTriple[0].value;
        
        // 获取所有三张
        const triples = player.getTriples();
        
        // 找出比上一组三张牌大的最小三张
        let tripleToPlay = null;
        for (const triple of triples) {
            if (triple[0].value > lastTripleValue) {
                if (!tripleToPlay || triple[0].value < tripleToPlay[0].value) {
                    tripleToPlay = triple;
                }
            }
        }
        
        if (tripleToPlay) {
            this.playCards(player, tripleToPlay);
        } else {
            this.pass(player);
        }
    }

    /**
     * 出牌
     * @param {Player} player - AI玩家
     * @param {Card[]} cards - 要出的牌
     */
    playCards(player, cards) {
        this.eventBus.emit('play-cards', {
            player: player,
            cards: cards
        });
    }

    /**
     * 不出
     * @param {Player} player - AI玩家
     */
    pass(player) {
        this.eventBus.emit('pass', {
            player: player
        });
    }
}