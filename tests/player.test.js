/**
 * Player类的单元测试
 */

describe('Player类测试', () => {
    // 测试Player类的构造函数
    test('Player构造函数应该正确初始化玩家属性', () => {
        const player = new Player('1', '测试玩家', true);
        
        expect(player.id).toBe('1');
        expect(player.name).toBe('测试玩家');
        expect(player.isHuman).toBe(true);
        expect(player.cards).toEqual([]);
        expect(player.playedCards).toEqual([]);
    });
    
    // 测试添加卡牌
    test('addCard方法应该正确添加卡牌', () => {
        const player = new Player('1', '测试玩家', true);
        const card = new Card('hearts', '10');
        
        player.addCard(card);
        
        expect(player.cards.length).toBe(1);
        expect(player.cards[0]).toBe(card);
    });
    
    // 测试移除卡牌
    test('removeCards方法应该正确移除卡牌', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '10');
        const card2 = new Card('spades', '5');
        
        player.addCard(card1);
        player.addCard(card2);
        
        const result = player.removeCards([card1]);
        
        expect(result).toBe(true);
        expect(player.cards.length).toBe(1);
        expect(player.cards[0]).toBe(card2);
    });
    
    // 测试移除不存在的卡牌
    test('removeCards方法在卡牌不存在时应该返回false', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '10');
        const card2 = new Card('spades', '5');
        
        player.addCard(card1);
        
        const result = player.removeCards([card2]);
        
        expect(result).toBe(false);
        expect(player.cards.length).toBe(1);
        expect(player.cards[0]).toBe(card1);
    });
    
    // 测试排序卡牌
    test('sortCards方法应该正确排序卡牌', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '3'); // 值为3
        const card2 = new Card('spades', '10'); // 值为10
        const card3 = new Card('diamonds', '1'); // 值为14(A)
        
        player.addCard(card1);
        player.addCard(card3);
        player.addCard(card2);
        
        player.sortCards();
        
        // 应该按照值从小到大排序
        expect(player.cards[0]).toBe(card1);
        expect(player.cards[1]).toBe(card2);
        expect(player.cards[2]).toBe(card3);
    });
    
    // 测试获取对子
    test('getPairs方法应该正确返回所有对子', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '5');
        const card2 = new Card('spades', '5');
        const card3 = new Card('diamonds', '5');
        const card4 = new Card('clubs', '10');
        const card5 = new Card('hearts', '10');
        
        player.addCard(card1);
        player.addCard(card2);
        player.addCard(card3);
        player.addCard(card4);
        player.addCard(card5);
        
        const pairs = player.getPairs();
        
        expect(pairs.length).toBe(2);
        
        // 第一个对子应该是5
        expect(pairs[0].length).toBe(2);
        expect(pairs[0][0].rank).toBe('5');
        expect(pairs[0][1].rank).toBe('5');
        
        // 第二个对子应该是10
        expect(pairs[1].length).toBe(2);
        expect(pairs[1][0].rank).toBe('10');
        expect(pairs[1][1].rank).toBe('10');
    });
    
    // 测试获取三张
    test('getTriples方法应该正确返回所有三张', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '5');
        const card2 = new Card('spades', '5');
        const card3 = new Card('diamonds', '5');
        const card4 = new Card('clubs', '10');
        
        player.addCard(card1);
        player.addCard(card2);
        player.addCard(card3);
        player.addCard(card4);
        
        const triples = player.getTriples();
        
        expect(triples.length).toBe(1);
        expect(triples[0].length).toBe(3);
        expect(triples[0][0].rank).toBe('5');
        expect(triples[0][1].rank).toBe('5');
        expect(triples[0][2].rank).toBe('5');
    });
    
    // 测试获取最大牌
    test('getLargestCard方法应该返回值最大的牌', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '3');
        const card2 = new Card('spades', '10');
        const card3 = new Card('diamonds', '1'); // A的值是14
        
        player.addCard(card1);
        player.addCard(card2);
        player.addCard(card3);
        
        const largestCard = player.getLargestCard();
        
        expect(largestCard).toBe(card3);
    });
    
    // 测试获取最小牌
    test('getSmallestCard方法应该返回值最小的牌', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '3');
        const card2 = new Card('spades', '10');
        const card3 = new Card('diamonds', '1'); // A的值是14
        
        player.addCard(card1);
        player.addCard(card2);
        player.addCard(card3);
        
        const smallestCard = player.getSmallestCard();
        
        expect(smallestCard).toBe(card1);
    });
    
    // 测试获取选中的牌
    test('getSelectedCards方法应该返回所有选中的牌', () => {
        const player = new Player('1', '测试玩家', true);
        const card1 = new Card('hearts', '3');
        const card2 = new Card('spades', '10');
        const card3 = new Card('diamonds', '1');
        
        card1.selected = true;
        card3.selected = true;
        
        player.addCard(card1);
        player.addCard(card2);
        player.addCard(card3);
        
        const selectedCards = player.getSelectedCards();
        
        expect(selectedCards.length).toBe(2);
        expect(selectedCards).toContain(card1);
        expect(selectedCards).toContain(card3);
    });
});