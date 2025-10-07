/**
 * CardManager类的单元测试
 */

describe('CardManager类测试', () => {
    // 测试CardManager类的构造函数
    test('CardManager构造函数应该正确初始化', () => {
        const cardManager = new CardManager();
        
        expect(cardManager.cards).toEqual([]);
    });
    
    // 测试初始化卡牌
    test('initCards方法应该创建一副完整的扑克牌', () => {
        const cardManager = new CardManager();
        
        cardManager.initCards();
        
        // 一副完整的扑克牌有52张
        expect(cardManager.cards.length).toBe(52);
        
        // 检查是否包含所有花色和点数
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                const found = cardManager.cards.some(card => 
                    card.suit === suit && card.rank === rank
                );
                expect(found).toBe(true);
            }
        }
    });
    
    // 测试洗牌
    test('shuffleCards方法应该改变卡牌顺序', () => {
        const cardManager = new CardManager();
        
        cardManager.initCards();
        
        // 保存洗牌前的顺序
        const originalOrder = [...cardManager.cards];
        
        // 洗牌
        cardManager.shuffleCards();
        
        // 检查卡牌数量是否保持不变
        expect(cardManager.cards.length).toBe(52);
        
        // 检查顺序是否改变
        // 注意：理论上洗牌后可能和原顺序相同，但概率极低
        let different = false;
        for (let i = 0; i < cardManager.cards.length; i++) {
            if (cardManager.cards[i] !== originalOrder[i]) {
                different = true;
                break;
            }
        }
        
        expect(different).toBe(true);
    });
    
    // 测试发牌
    test('dealCards方法应该正确分发卡牌给玩家', () => {
        const cardManager = new CardManager();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        const player3 = new Player('2', '玩家3', false);
        
        cardManager.initCards();
        cardManager.dealCards([player1, player2, player3]);
        
        // 三个玩家应该平分52张牌
        expect(player1.cards.length).toBe(18); // 第一个玩家18张
        expect(player2.cards.length).toBe(17); // 第二个玩家17张
        expect(player3.cards.length).toBe(17); // 第三个玩家17张
        
        // 卡牌管理器中应该没有牌了
        expect(cardManager.cards.length).toBe(0);
    });
    
    // 测试获取牌型
    test('getCardsType方法应该正确识别牌型', () => {
        const cardManager = new CardManager();
        
        // 单张
        const singleCard = [new Card('hearts', '10')];
        expect(cardManager.getCardsType(singleCard)).toBe('single');
        
        // 对子
        const pairCards = [
            new Card('hearts', '10'),
            new Card('spades', '10')
        ];
        expect(cardManager.getCardsType(pairCards)).toBe('pair');
        
        // 三张
        const tripleCards = [
            new Card('hearts', '10'),
            new Card('spades', '10'),
            new Card('diamonds', '10')
        ];
        expect(cardManager.getCardsType(tripleCards)).toBe('triple');
        
        // 无效牌型
        const invalidCards = [
            new Card('hearts', '10'),
            new Card('spades', '9')
        ];
        expect(cardManager.getCardsType(invalidCards)).toBe('invalid');
    });
    
    // 测试检查出牌是否有效
    test('checkValidPlay方法应该正确判断出牌是否有效', () => {
        const cardManager = new CardManager();
        
        // 第一次出牌，任何牌型都有效
        const firstPlay = [new Card('hearts', '3')];
        expect(cardManager.checkValidPlay(firstPlay, null)).toBe(true);
        
        // 出单张，需要比上一次大
        const lastSingle = [new Card('hearts', '3')];
        const validSingle = [new Card('spades', '10')];
        const invalidSingle = [new Card('clubs', '2')];
        
        expect(cardManager.checkValidPlay(validSingle, lastSingle)).toBe(true);
        expect(cardManager.checkValidPlay(invalidSingle, lastSingle)).toBe(false);
        
        // 出对子，需要比上一次大
        const lastPair = [
            new Card('hearts', '3'),
            new Card('spades', '3')
        ];
        const validPair = [
            new Card('hearts', '10'),
            new Card('spades', '10')
        ];
        const invalidPair = [
            new Card('hearts', '2'),
            new Card('spades', '2')
        ];
        
        expect(cardManager.checkValidPlay(validPair, lastPair)).toBe(true);
        expect(cardManager.checkValidPlay(invalidPair, lastPair)).toBe(false);
        
        // 牌型必须匹配
        expect(cardManager.checkValidPlay(validSingle, lastPair)).toBe(false);
        expect(cardManager.checkValidPlay(validPair, lastSingle)).toBe(false);
    });
    
    // 测试比较牌的大小
    test('compareCards方法应该正确比较牌的大小', () => {
        const cardManager = new CardManager();
        
        const smallCard = new Card('clubs', '3');
        const bigCard = new Card('hearts', '10');
        
        expect(cardManager.compareCards(smallCard, bigCard)).toBe(-1);
        expect(cardManager.compareCards(bigCard, smallCard)).toBe(1);
        expect(cardManager.compareCards(bigCard, bigCard)).toBe(0);
    });
});