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
        console.log(`AI决策开始 - 玩家: ${player.name}, 手牌数量: ${player.cards.length}, 是否有上一次有效出牌: ${!!gameState.lastValidPlay}`);
        
        // 如果没有上一次有效出牌，则尝试出对子、三张或最小的牌
        if (!gameState.lastValidPlay) {
            console.log('AI决策: 没有上一次有效出牌，尝试自由出牌');
            
            // 尝试出对子或三张
            const pairs = player.getPairs();
            console.log(`AI决策: 找到 ${pairs.length} 个对子`);
            if (pairs.length > 0) {
                // 随机决定是否出对子
                if (Math.random() > 0.5) {
                    console.log('AI决策: 选择出对子');
                    this.playCards(player, pairs[0]);
                    return;
                }
            }
            
            const triples = player.getTriples();
            console.log(`AI决策: 找到 ${triples.length} 个三张`);
            if (triples.length > 0) {
                // 随机决定是否出三张
                if (Math.random() > 0.7) {
                    console.log('AI决策: 选择出三张');
                    this.playCards(player, triples[0]);
                    return;
                }
            }
            
            const smallestCard = player.getSmallestCard();
            console.log(`AI决策: 最小牌为 ${smallestCard ? smallestCard.getDisplayName() : 'null'}`);
            if (smallestCard) {
                console.log('AI决策: 选择出最小牌');
                this.playCards(player, [smallestCard]);
            } else {
                console.log('AI决策: 没有牌可出，选择不出');
                this.pass(player);
            }
            return;
        }
        
        // 尝试出比上一次有效出牌更大的牌
        const lastCards = gameState.lastValidPlay;
        const lastCardsType = cardManager.getCardsType(lastCards);
        
        // 根据上一次出牌的类型，尝试出更大的牌
        console.log(`AI决策: 上一次出牌类型: ${lastCardsType}`);
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
                console.log('AI决策: 无法识别的出牌类型，选择不出');
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
        console.log(`AI尝试出单张牌 - 上一张牌: ${lastCard.getDisplayName()}`);
        
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
            console.log(`AI决策: 出单张牌 ${cardToPlay.getDisplayName()}`);
            this.playCards(player, [cardToPlay]);
        } else {
            console.log('AI决策: 没有更大的单张牌，选择不出');
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
        console.log(`AI尝试出对子 - 上一对牌值: ${lastPairValue}`);
        
        // 获取所有对子
        const pairs = player.getPairs();
        console.log(`AI决策: 找到 ${pairs.length} 个对子`);
        
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
            console.log(`AI决策: 出对子 ${pairToPlay[0].getDisplayName()}`);
            this.playCards(player, pairToPlay);
        } else {
            console.log('AI决策: 没有更大的对子，选择不出');
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
        console.log(`AI尝试出三张 - 上一组三张牌值: ${lastTripleValue}`);
        
        // 获取所有三张
        const triples = player.getTriples();
        console.log(`AI决策: 找到 ${triples.length} 个三张`);
        
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
            console.log(`AI决策: 出三张 ${tripleToPlay[0].getDisplayName()}`);
            this.playCards(player, tripleToPlay);
        } else {
            console.log('AI决策: 没有更大的三张，选择不出');
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