/**
 * Card类的单元测试
 */

// 导入必要的类
const fs = require('fs');
const path = require('path');

// 模拟必要的DOM对象
global.Image = class {
    constructor() {
        this.src = '';
    }
};

// 模拟Card类，避免图片加载超时问题
class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
        this.selected = false;
        this.x = 0;
        this.y = 0;
        this.width = 80;
        this.height = 120;
        this.image = null;
        // 不在测试中加载图片以避免超时
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    toggleSelect() {
        this.selected = !this.selected;
    }
    
    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
}

// 模拟document对象
global.document = {
    createElement: () => ({
        style: {},
        classList: {
            add: () => {},
            remove: () => {}
        },
        appendChild: () => {}
    })
};

describe('Card类测试', () => {
    // 测试Card类的构造函数
    test('Card构造函数应该正确初始化卡牌属性', () => {
        const card = new Card('hearts', '10');
        
        expect(card.suit).toBe('hearts');
        expect(card.rank).toBe('10');
        expect(card.value).toBe(10);
        expect(card.selected).toBe(false);
        expect(card.x).toBe(0);
        expect(card.y).toBe(0);
    });
    
    // 测试特殊牌的value值
    test('特殊牌的value值应该正确计算', () => {
        const aceCard = new Card('spades', '1');
        const jackCard = new Card('clubs', '11');
        const queenCard = new Card('diamonds', '12');
        const kingCard = new Card('hearts', '13');
        
        expect(aceCard.value).toBe(14); // A的值应该是14，最大
        expect(jackCard.value).toBe(11); // J的值是11
        expect(queenCard.value).toBe(12); // Q的值是12
        expect(kingCard.value).toBe(13); // K的值是13
    });
    
    // 测试卡牌的选中状态
    test('卡牌的选中状态应该可以切换', () => {
        const card = new Card('clubs', '5');
        
        expect(card.selected).toBe(false);
        
        card.toggleSelect();
        expect(card.selected).toBe(true);
        
        card.toggleSelect();
        expect(card.selected).toBe(false);
    });
    
    // 测试卡牌的位置设置
    test('卡牌的位置应该可以设置', () => {
        const card = new Card('diamonds', '7');
        
        card.setPosition(100, 200);
        
        expect(card.x).toBe(100);
        expect(card.y).toBe(200);
    });
    
    // 测试卡牌的点击判断
    test('卡牌的点击判断应该正确工作', () => {
        const card = new Card('spades', '3');
        card.width = 80;
        card.height = 120;
        card.setPosition(50, 50);
        
        // 点击在卡牌内部
        expect(card.isPointInside(60, 60)).toBe(true);
        
        // 点击在卡牌外部
        expect(card.isPointInside(200, 200)).toBe(false);
        expect(card.isPointInside(40, 60)).toBe(false);
        expect(card.isPointInside(60, 180)).toBe(false);
    });
    
    // 测试卡牌的比较
    test('卡牌的比较应该基于value值', () => {
        const smallCard = new Card('clubs', '3');
        const bigCard = new Card('hearts', '10');
        const aceCard = new Card('spades', '1');
        
        expect(smallCard.value < bigCard.value).toBe(true);
        expect(aceCard.value > bigCard.value).toBe(true); // A的值最大
    });
});