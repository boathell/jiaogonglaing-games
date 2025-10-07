/**
 * 出牌功能测试
 * 测试玩家出牌的各种场景和规则验证
 */

// 设置测试环境
global.document = {
    getElementById: () => ({
        innerHTML: '',
        style: {},
        classList: {
            add: () => {},
            remove: () => {}
        },
        appendChild: () => {},
        addEventListener: () => {}
    })
};

global.setTimeout = (callback, delay) => {
    callback();
};

describe('出牌功能测试', () => {
    let gameEngine;
    let eventBus;
    let mockUIManager;
    let mockAIManager;
    
    beforeEach(() => {
        // 创建事件总线
        eventBus = new EventBus();
        
        // 创建游戏引擎
        gameEngine = new GameEngine();
        
        // 创建模拟的UI管理器
        mockUIManager = {
            init: jest.fn(),
            updateGameState: jest.fn(),
            showMessage: jest.fn()
        };
        
        // 创建模拟的AI管理器
        mockAIManager = {
            init: jest.fn(),
            makeDecision: jest.fn()
        };
        
        // 初始化游戏引擎
        gameEngine.init(mockUIManager, mockAIManager, eventBus);
        
        // 开始新游戏
        gameEngine.startNewGame();
    });
    
    describe('基本出牌功能', () => {
        test('玩家应该可以出有效的单张牌', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            const cardToPlay = currentPlayer.cards[0];
            const cards = [cardToPlay];
            
            const cardsPlayedSpy = jest.fn();
            const turnChangedSpy = jest.fn();
            
            eventBus.on('cards-played', cardsPlayedSpy);
            eventBus.on('turn-changed', turnChangedSpy);
            
            // 出牌
            gameEngine.handlePlayerPlay({ player: currentPlayer, cards });
            
            // 验证出牌成功
            expect(cardsPlayedSpy).toHaveBeenCalled();
            expect(cardsPlayedSpy.mock.calls[0][0].player).toBe(currentPlayer);
            expect(cardsPlayedSpy.mock.calls[0][0].cards).toBe(cards);
            expect(cardsPlayedSpy.mock.calls[0][0].remainingCards).toBe(currentPlayer.cards.length);
            
            // 验证切换到下一个玩家
            expect(turnChangedSpy).toHaveBeenCalled();
        });
        
        test('玩家应该可以出有效的对子', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 找到或创建一对牌
            let pairCards = [];
            for (let i = 0; i < currentPlayer.cards.length - 1; i++) {
                for (let j = i + 1; j < currentPlayer.cards.length; j++) {
                    if (currentPlayer.cards[i].rank === currentPlayer.cards[j].rank) {
                        pairCards = [currentPlayer.cards[i], currentPlayer.cards[j]];
                        break;
                    }
                }
                if (pairCards.length > 0) break;
            }
            
            // 如果没有找到对子，手动创建一对用于测试
            if (pairCards.length === 0) {
                const testCard1 = new Card('hearts', '10');
                const testCard2 = new Card('spades', '10');
                currentPlayer.cards.push(testCard1, testCard2);
                pairCards = [testCard1, testCard2];
            }
            
            const cardsPlayedSpy = jest.fn();
            eventBus.on('cards-played', cardsPlayedSpy);
            
            // 出对子
            gameEngine.handlePlayerPlay({ player: currentPlayer, cards: pairCards });
            
            // 验证出牌成功
            expect(cardsPlayedSpy).toHaveBeenCalled();
            expect(gameEngine.gameState.lastValidPlay).toBe(pairCards);
        });
        
        test('玩家应该可以出有效的三张', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 手动创建三张用于测试
            const tripleCards = [
                new Card('hearts', '10'),
                new Card('spades', '10'),
                new Card('diamonds', '10')
            ];
            
            // 将三张牌添加到玩家手牌中
            currentPlayer.cards.push(...tripleCards);
            
            const cardsPlayedSpy = jest.fn();
            eventBus.on('cards-played', cardsPlayedSpy);
            
            // 出三张
            gameEngine.handlePlayerPlay({ player: currentPlayer, cards: tripleCards });
            
            // 验证出牌成功
            expect(cardsPlayedSpy).toHaveBeenCalled();
            expect(gameEngine.gameState.lastValidPlay).toBe(tripleCards);
        });
    });
    
    describe('出牌规则验证', () => {
        test('非当前玩家不能出牌', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            const nextPlayerIndex = (gameEngine.gameState.currentPlayerIndex + 1) % 3;
            const nextPlayer = gameEngine.gameState.players[nextPlayerIndex];
            
            const cardToPlay = nextPlayer.cards[0];
            const cards = [cardToPlay];
            
            const cardsPlayedSpy = jest.fn();
            const invalidPlaySpy = jest.fn();
            
            eventBus.on('cards-played', cardsPlayedSpy);
            eventBus.on('invalid-play', invalidPlaySpy);
            
            // 让非当前玩家尝试出牌
            gameEngine.handlePlayerPlay({ player: nextPlayer, cards });
            
            // 验证出牌失败
            expect(cardsPlayedSpy).not.toHaveBeenCalled();
            expect(gameEngine.gameState.lastValidPlay).toBe(null);
        });
        
        test('玩家不能出无效的牌型', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 创建无效的牌型（不同点数）
            const invalidCards = [
                new Card('hearts', '10'),
                new Card('spades', '5')
            ];
            
            // 将牌添加到玩家手牌中
            currentPlayer.cards.push(...invalidCards);
            
            const invalidPlaySpy = jest.fn();
            eventBus.on('invalid-play', invalidPlaySpy);
            
            // 尝试出无效牌型
            gameEngine.handlePlayerPlay({ player: currentPlayer, cards: invalidCards });
            
            // 验证出牌被拒绝
            expect(invalidPlaySpy).toHaveBeenCalled();
            expect(gameEngine.gameState.lastValidPlay).toBe(null);
        });
        
        test('玩家必须出比前一次更大的牌', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 先设置一个有效出牌（10）
            const lastPlay = [new Card('hearts', '10')];
            gameEngine.gameState.recordValidPlay(lastPlay);
            gameEngine.gameState.nextPlayer(); // 切换到下一个玩家
            
            const nextPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 创建比10小的牌
            const smallerCard = new Card('clubs', '5');
            nextPlayer.cards.push(smallerCard);
            
            const invalidPlaySpy = jest.fn();
            eventBus.on('invalid-play', invalidPlaySpy);
            
            // 尝试出更小的牌
            gameEngine.handlePlayerPlay({ player: nextPlayer, cards: [smallerCard] });
            
            // 验证出牌被拒绝
            expect(invalidPlaySpy).toHaveBeenCalled();
            expect(gameEngine.gameState.lastValidPlay).toBe(lastPlay);
        });
        
        test('玩家可以出比前一次更大的牌', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 先设置一个有效出牌（5）
            const lastPlay = [new Card('hearts', '5')];
            gameEngine.gameState.recordValidPlay(lastPlay);
            gameEngine.gameState.nextPlayer(); // 切换到下一个玩家
            
            const nextPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 创建比5大的牌
            const biggerCard = new Card('clubs', '10');
            nextPlayer.cards.push(biggerCard);
            
            const cardsPlayedSpy = jest.fn();
            eventBus.on('cards-played', cardsPlayedSpy);
            
            // 尝试出更大的牌
            gameEngine.handlePlayerPlay({ player: nextPlayer, cards: [biggerCard] });
            
            // 验证出牌成功
            expect(cardsPlayedSpy).toHaveBeenCalled();
            expect(gameEngine.gameState.lastValidPlay).toEqual([biggerCard]);
        });
    });
    
    describe('牌型匹配验证', () => {
        test('单张必须跟单张', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 先设置一个单张出牌
            const lastSingle = [new Card('hearts', '5')];
            gameEngine.gameState.recordValidPlay(lastSingle);
            gameEngine.gameState.nextPlayer();
            
            const nextPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 创建对子牌
            const pairCards = [
                new Card('clubs', '10'),
                new Card('spades', '10')
            ];
            nextPlayer.cards.push(...pairCards);
            
            const invalidPlaySpy = jest.fn();
            eventBus.on('invalid-play', invalidPlaySpy);
            
            // 尝试用对子跟单张
            gameEngine.handlePlayerPlay({ player: nextPlayer, cards: pairCards });
            
            // 验证出牌被拒绝
            expect(invalidPlaySpy).toHaveBeenCalled();
        });
        
        test('对子必须跟对子', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 先设置一个对子出牌
            const lastPair = [
                new Card('hearts', '5'),
                new Card('spades', '5')
            ];
            gameEngine.gameState.recordValidPlay(lastPair);
            gameEngine.gameState.nextPlayer();
            
            const nextPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 创建单张
            const singleCard = new Card('clubs', '10');
            nextPlayer.cards.push(singleCard);
            
            const invalidPlaySpy = jest.fn();
            eventBus.on('invalid-play', invalidPlaySpy);
            
            // 尝试用单张跟对子
            gameEngine.handlePlayerPlay({ player: nextPlayer, cards: [singleCard] });
            
            // 验证出牌被拒绝
            expect(invalidPlaySpy).toHaveBeenCalled();
        });
    });
    
    describe('游戏结束检测', () => {
        test('玩家出完所有牌应该触发游戏结束', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            
            // 清空玩家手牌，只留一张
            const lastCard = currentPlayer.cards[0];
            currentPlayer.cards = [lastCard];
            
            const gameOverSpy = jest.fn();
            eventBus.on('game-over', gameOverSpy);
            
            // 出最后一张牌
            gameEngine.handlePlayerPlay({ player: currentPlayer, cards: [lastCard] });
            
            // 验证游戏结束事件被触发
            expect(gameOverSpy).toHaveBeenCalled();
            expect(gameOverSpy.mock.calls[0][0].winner).toBe(currentPlayer);
        });
        
        test('玩家出牌后应该正确移除手牌', () => {
            const currentPlayer = gameEngine.gameState.getCurrentPlayer();
            const initialCardCount = currentPlayer.cards.length;
            const cardToPlay = currentPlayer.cards[0];
            
            // 出牌
            gameEngine.handlePlayerPlay({ player: currentPlayer, cards: [cardToPlay] });
            
            // 验证手牌数量减少
            expect(currentPlayer.cards.length).toBe(initialCardCount - 1);
            
            // 验证出的牌不在手牌中
            const hasPlayedCard = currentPlayer.cards.some(card => 
                card.suit === cardToPlay.suit && card.rank === cardToPlay.rank
            );
            expect(hasPlayedCard).toBe(false);
        });
    });
});