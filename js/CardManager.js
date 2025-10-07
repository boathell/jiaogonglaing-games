/**
 * 卡牌管理类
 * 负责卡牌的初始化、洗牌、发牌和牌型判断
 */
class CardManager {
    /**
     * 构造函数
     */
    constructor() {
        this.allCards = [];
    }

    /**
     * 初始化卡牌
     */
    initCards() {
        this.allCards = [];
        
        // 花色和点数
        const suits = ['spade', 'heart', 'club', 'diamond'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        
        // 生成普通牌
        let value = 3;
        for (const rank of ranks) {
            for (const suit of suits) {
                this.allCards.push(new Card(suit, rank, value));
            }
            value++;
        }
        
        // 添加大小王
        this.allCards.push(new Card('joker', 'joker1', 16)); // 小王
        this.allCards.push(new Card('joker', 'joker2', 17)); // 大王
        
        return this.allCards;
    }

    /**
     * 洗牌
     */
    shuffleCards() {
        // Fisher-Yates 洗牌算法
        for (let i = this.allCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allCards[i], this.allCards[j]] = [this.allCards[j], this.allCards[i]];
        }
        
        return this.allCards;
    }

    /**
     * 发牌
     * @param {Player[]} players - 玩家数组
     */
    dealCards(players) {
        if (players.length !== 3) {
            console.error('交公粮需要3名玩家');
            return false;
        }
        
        // 确保每个玩家的手牌是空的
        for (const player of players) {
            player.cards = [];
        }
        
        // 每人18张牌
        for (let i = 0; i < this.allCards.length; i++) {
            const playerIndex = i % players.length;
            players[playerIndex].addCard(this.allCards[i]);
        }
        
        return true;
    }

    /**
     * 判断牌型
     * @param {Card[]} cards - 要判断的牌
     * @returns {string} - 牌型 (single, pair, triple, invalid)
     */
    identifyCardPattern(cards) {
        if (!cards || cards.length === 0) {
            return 'invalid';
        }
        
        // 单张
        if (cards.length === 1) {
            return 'single';
        }
        
        // 对子
        if (cards.length === 2) {
            if (cards[0].value === cards[1].value) {
                return 'pair';
            }
            return 'invalid';
        }
        
        // 三张
        if (cards.length === 3) {
            if (cards[0].value === cards[1].value && cards[1].value === cards[2].value) {
                return 'triple';
            }
            return 'invalid';
        }
        
        return 'invalid';
    }

    /**
     * 检查出牌是否有效
     * @param {Card[]} cards - 要出的牌
     * @param {Card[]} lastPlay - 上一次有效出牌
     * @returns {boolean} - 是否有效
     */
    checkValidPlay(cards, lastPlay) {
        // 如果没有上一次出牌，则任何有效牌型都可以出
        if (!lastPlay || lastPlay.length === 0) {
            return this.identifyCardPattern(cards) !== 'invalid';
        }
        
        // 牌型必须相同
        const currentPattern = this.identifyCardPattern(cards);
        const lastPattern = this.identifyCardPattern(lastPlay);
        
        if (currentPattern === 'invalid' || currentPattern !== lastPattern) {
            return false;
        }
        
        // 牌型相同，比较大小
        return this.compareCards(cards, lastPlay) > 0;
    }

    /**
     * 比较两组牌的大小
     * @param {Card[]} cards1 - 第一组牌
     * @param {Card[]} cards2 - 第二组牌
     * @returns {number} - 如果cards1大于cards2返回1，小于返回-1，无法比较返回0
     */
    compareCards(cards1, cards2) {
        // 牌型必须相同才能比较
        const pattern1 = this.identifyCardPattern(cards1);
        const pattern2 = this.identifyCardPattern(cards2);
        
        // 牌型不同，无法比较
        if (pattern1 !== pattern2 || pattern1 === 'invalid' || pattern2 === 'invalid') {
            return 0;
        }
        
        // 确保比较相同点数的牌
        const value1 = cards1.length > 0 ? cards1[0].value : 0;
        const value2 = cards2.length > 0 ? cards2[0].value : 0;
        
        // 比较牌的大小
        if (value1 > value2) {
            return 1;
        } else if (value1 < value2) {
            return -1;
        } else {
            return 0;
        }
    }
}