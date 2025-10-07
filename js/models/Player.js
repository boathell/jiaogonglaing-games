/**
 * 玩家类
 * 表示游戏中的一名玩家
 */
class Player {
    /**
     * 构造函数
     * @param {string} id - 玩家ID
     * @param {string} name - 玩家名称
     * @param {boolean} isHuman - 是否为人类玩家
     */
    constructor(id, name, isHuman = false) {
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
        this.cards = [];
        this.playHistory = [];
    }

    /**
     * 添加一张卡牌
     * @param {Card} card - 要添加的卡牌
     */
    addCard(card) {
        this.cards.push(card);
        this.sortCards();
    }

    /**
     * 移除多张卡牌
     * @param {Card[]} cardsToRemove - 要移除的卡牌数组
     * @returns {boolean} - 是否成功移除
     */
    removeCards(cardsToRemove) {
        if (!cardsToRemove || cardsToRemove.length === 0) {
            return false;
        }

        // 检查所有要移除的牌是否都在玩家手中
        const allCardsExist = cardsToRemove.every(card => 
            this.cards.some(c => c.suit === card.suit && c.rank === card.rank)
        );

        if (!allCardsExist) {
            return false;
        }

        // 移除卡牌
        for (const card of cardsToRemove) {
            const index = this.cards.findIndex(c => 
                c.suit === card.suit && c.rank === card.rank
            );
            if (index !== -1) {
                this.cards.splice(index, 1);
            }
        }

        // 记录出牌历史
        this.playHistory.push([...cardsToRemove]);
        
        return true;
    }

    /**
     * 对手牌进行排序
     */
    sortCards() {
        this.cards.sort((a, b) => a.value - b.value);
    }

    /**
     * 获取所有对子
     * @returns {Card[][]} - 对子数组
     */
    getPairs() {
        const pairs = [];
        const valueCount = {};
        
        // 统计每个值的卡牌数量
        for (const card of this.cards) {
            if (!valueCount[card.value]) {
                valueCount[card.value] = [];
            }
            valueCount[card.value].push(card);
        }
        
        // 找出所有对子
        for (const value in valueCount) {
            if (valueCount[value].length >= 2) {
                pairs.push(valueCount[value].slice(0, 2));
            }
        }
        
        return pairs;
    }

    /**
     * 获取所有三张
     * @returns {Card[][]} - 三张数组
     */
    getTriples() {
        const triples = [];
        const valueCount = {};
        
        // 统计每个值的卡牌数量
        for (const card of this.cards) {
            if (!valueCount[card.value]) {
                valueCount[card.value] = [];
            }
            valueCount[card.value].push(card);
        }
        
        // 找出所有三张
        for (const value in valueCount) {
            if (valueCount[value].length >= 3) {
                triples.push(valueCount[value].slice(0, 3));
            }
        }
        
        return triples;
    }

    /**
     * 获取所有四张
     * @returns {Card[][]} - 四张数组
     */
    getFours() {
        const fours = [];
        const valueCount = {};
        
        // 统计每个值的卡牌数量
        for (const card of this.cards) {
            if (!valueCount[card.value]) {
                valueCount[card.value] = [];
            }
            valueCount[card.value].push(card);
        }
        
        // 找出所有四张
        for (const value in valueCount) {
            if (valueCount[value].length >= 4) {
                fours.push(valueCount[value].slice(0, 4));
            }
        }
        
        return fours;
    }

    /**
     * 获取玩家手中最大的牌
     * @returns {Card|null} - 最大的牌，如果没有牌则返回null
     */
    getLargestCard() {
        if (this.cards.length === 0) {
            return null;
        }
        
        return this.cards.reduce((max, card) => 
            card.value > max.value ? card : max, this.cards[0]);
    }

    /**
     * 获取玩家手中最小的牌
     * @returns {Card|null} - 最小的牌，如果没有牌则返回null
     */
    getSmallestCard() {
        if (this.cards.length === 0) {
            return null;
        }
        
        return this.cards.reduce((min, card) => 
            card.value < min.value ? card : min, this.cards[0]);
    }

    /**
     * 获取选中的牌
     * @returns {Card[]} - 选中的牌数组
     */
    getSelectedCards() {
        return this.cards.filter(card => card.selected);
    }

    /**
     * 清除所有牌的选中状态
     */
    clearSelection() {
        for (const card of this.cards) {
            card.selected = false;
        }
    }
}