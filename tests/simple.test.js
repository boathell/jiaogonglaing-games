/**
 * 简单测试用例
 * 测试基本的游戏功能
 */

// 定义简单的Card类用于测试
class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value || this.calculateValue(rank);
        this.selected = false;
    }
    
    calculateValue(rank) {
        const rankValues = {
            '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            '11': 11, '12': 12, '13': 13, '1': 14, '2': 15
        };
        return rankValues[rank] || 0;
    }
    
    toggleSelect() {
        this.selected = !this.selected;
    }
}

// 定义简单的EventBus类
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

// 定义简单的Player类
class Player {
    constructor(id, name, isHuman = false) {
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
        this.cards = [];
    }
    
    addCard(card) {
        this.cards.push(card);
    }
    
    removeCards(cards) {
        cards.forEach(card => {
            const index = this.cards.findIndex(c => c.suit === card.suit && c.rank === card.rank);
            if (index !== -1) {
                this.cards.splice(index, 1);
            }
        });
        return true;
    }
}

// 定义简单的GameState类
class GameState {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.lastValidPlay = null;
        this.passCount = 0;
        this.phase = 'INIT';
    }
    
    initPlayers(players) {
        this.players = players;
    }
    
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    
    recordValidPlay(cards) {
        this.lastValidPlay = cards;
        this.passCount = 0;
    }
    
    recordPass() {
        this.passCount++;
    }
    
    reset() {
        this.currentPlayerIndex = 0;
        this.lastValidPlay = null;
        this.passCount = 0;
        this.phase = 'INIT';
    }
}

// 定义简单的CardManager类
class CardManager {
    constructor() {
        this.cards = [];
    }
    
    initCards() {
        this.cards = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '1', '2'];
        
        suits.forEach(suit => {
            ranks.forEach(rank => {
                this.cards.push(new Card(suit, rank));
            });
        });
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    dealCards(players) {
        let cardIndex = 0;
        players.forEach((player, index) => {
            const cardCount = index === 0 ? 18 : 17;
            for (let i = 0; i < cardCount; i++) {
                if (cardIndex < this.cards.length) {
                    player.addCard(this.cards[cardIndex++]);
                }
            }
        });
        this.cards = [];
    }
    
    getCardsType(cards) {
        if (cards.length === 1) return 'single';
        if (cards.length === 2 && cards[0].rank === cards[1].rank) return 'pair';
        if (cards.length === 3 && cards.every(card => card.rank === cards[0].rank)) return 'triple';
        return 'invalid';
    }
    
    checkValidPlay(cards, lastPlay) {
        const cardType = this.getCardsType(cards);
        if (cardType === 'invalid') return false;
        
        if (!lastPlay) return true; // 第一次出牌总是有效的
        
        const lastPlayType = this.getCardsType(lastPlay);
        if (cardType !== lastPlayType) return false; // 牌型必须匹配
        
        // 检查大小
        return cards[0].value > lastPlay[0].value;
    }
}

// 测试开始
describe('交公粮游戏基本功能测试', () => {
    describe('卡牌功能测试', () => {
        test('Card应该正确创建', () => {
            const card = new Card('hearts', '10');
            expect(card.suit).toBe('hearts');
            expect(card.rank).toBe('10');
            expect(card.value).toBe(10);
            expect(card.selected).toBe(false);
        });
        
        test('Card应该可以切换选中状态', () => {
            const card = new Card('clubs', '5');
            expect(card.selected).toBe(false);
            
            card.toggleSelect();
            expect(card.selected).toBe(true);
            
            card.toggleSelect();
            expect(card.selected).toBe(false);
        });
    });
    
    describe('事件总线测试', () => {
        test('EventBus应该正确发布和订阅事件', () => {
            const eventBus = new EventBus();
            const callback = jest.fn();
            
            eventBus.on('test-event', callback);
            eventBus.emit('test-event', { data: 'test' });
            
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });
    });
    
    describe('玩家功能测试', () => {
        test('Player应该正确创建', () => {
            const player = new Player('0', '玩家', true);
            expect(player.id).toBe('0');
            expect(player.name).toBe('玩家');
            expect(player.isHuman).toBe(true);
            expect(player.cards.length).toBe(0);
        });
        
        test('Player应该可以添加和移除卡牌', () => {
            const player = new Player('0', '玩家', true);
            const card = new Card('hearts', '10');
            
            player.addCard(card);
            expect(player.cards.length).toBe(1);
            
            player.removeCards([card]);
            expect(player.cards.length).toBe(0);
        });
    });
    
    describe('游戏状态测试', () => {
        test('GameState应该正确管理玩家轮次', () => {
            const gameState = new GameState();
            const player1 = new Player('0', '玩家1', true);
            const player2 = new Player('1', '玩家2', false);
            
            gameState.initPlayers([player1, player2]);
            expect(gameState.getCurrentPlayer()).toBe(player1);
            
            gameState.nextPlayer();
            expect(gameState.getCurrentPlayer()).toBe(player2);
            
            gameState.nextPlayer();
            expect(gameState.getCurrentPlayer()).toBe(player1);
        });
        
        test('GameState应该正确记录出牌和不出', () => {
            const gameState = new GameState();
            const card = new Card('hearts', '10');
            
            gameState.recordValidPlay([card]);
            expect(gameState.lastValidPlay).toEqual([card]);
            expect(gameState.passCount).toBe(0);
            
            gameState.recordPass();
            expect(gameState.passCount).toBe(1);
        });
    });
    
    describe('卡牌管理器测试', () => {
        test('CardManager应该正确初始化卡牌', () => {
            const cardManager = new CardManager();
            cardManager.initCards();
            
            expect(cardManager.cards.length).toBe(52);
        });
        
        test('CardManager应该正确发牌', () => {
            const cardManager = new CardManager();
            const player1 = new Player('0', '玩家1', true);
            const player2 = new Player('1', '玩家2', false);
            const player3 = new Player('2', '玩家3', false);
            
            cardManager.initCards();
            cardManager.dealCards([player1, player2, player3]);
            
            expect(player1.cards.length).toBe(18);
            expect(player2.cards.length).toBe(17);
            expect(player3.cards.length).toBe(17);
            expect(cardManager.cards.length).toBe(0);
        });
        
        test('CardManager应该正确识别牌型', () => {
            const cardManager = new CardManager();
            
            const singleCard = [new Card('hearts', '10')];
            expect(cardManager.getCardsType(singleCard)).toBe('single');
            
            const pairCards = [
                new Card('hearts', '10'),
                new Card('spades', '10')
            ];
            expect(cardManager.getCardsType(pairCards)).toBe('pair');
            
            const tripleCards = [
                new Card('hearts', '10'),
                new Card('spades', '10'),
                new Card('diamonds', '10')
            ];
            expect(cardManager.getCardsType(tripleCards)).toBe('triple');
            
            const invalidCards = [
                new Card('hearts', '10'),
                new Card('spades', '5')
            ];
            expect(cardManager.getCardsType(invalidCards)).toBe('invalid');
        });
        
        test('CardManager应该正确验证出牌有效性', () => {
            const cardManager = new CardManager();
            
            // 第一次出牌总是有效
            const firstPlay = [new Card('hearts', '3')];
            expect(cardManager.checkValidPlay(firstPlay, null)).toBe(true);
            
            // 后续出牌必须更大
            const lastPlay = [new Card('hearts', '5')];
            const validPlay = [new Card('spades', '10')];
            const invalidPlay = [new Card('clubs', '3')];
            
            expect(cardManager.checkValidPlay(validPlay, lastPlay)).toBe(true);
            expect(cardManager.checkValidPlay(invalidPlay, lastPlay)).toBe(false);
            
            // 牌型必须匹配
            const pairPlay = [
                new Card('hearts', '10'),
                new Card('spades', '10')
            ];
            expect(cardManager.checkValidPlay(pairPlay, lastPlay)).toBe(false);
        });
    });
    
    describe('游戏流程集成测试', () => {
        test('完整的游戏流程应该正常工作', () => {
            const eventBus = new EventBus();
            const gameState = new GameState();
            const cardManager = new CardManager();
            
            // 创建玩家
            const players = [
                new Player('0', '玩家', true),
                new Player('1', '电脑1', false),
                new Player('2', '电脑2', false)
            ];
            
            gameState.initPlayers(players);
            
            // 初始化卡牌并发牌
            cardManager.initCards();
            cardManager.dealCards(players);
            
            // 验证发牌结果
            expect(players[0].cards.length).toBe(18);
            expect(players[1].cards.length).toBe(17);
            expect(players[2].cards.length).toBe(17);
            
            // 模拟出牌流程
            const currentPlayer = gameState.getCurrentPlayer();
            const cardToPlay = currentPlayer.cards[0];
            
            // 玩家出牌
            currentPlayer.removeCards([cardToPlay]);
            gameState.recordValidPlay([cardToPlay]);
            gameState.nextPlayer();
            
            // 验证游戏状态更新
            expect(gameState.lastValidPlay).toEqual([cardToPlay]);
            expect(gameState.passCount).toBe(0);
            expect(gameState.getCurrentPlayer()).toBe(players[1]);
            
            // 下一个玩家选择不出
            gameState.recordPass();
            gameState.nextPlayer();
            
            expect(gameState.passCount).toBe(1);
            expect(gameState.getCurrentPlayer()).toBe(players[2]);
        });
    });
});