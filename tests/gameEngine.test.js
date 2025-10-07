/**
 * GameEngine类的单元测试
 * 测试游戏引擎的核心功能，包括新游戏、发牌、不出等
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

describe('GameEngine类基本功能测试', () => {
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
    });
    
    describe('新游戏功能测试', () => {
        test('startNewGame应该正确初始化新游戏', () => {
            // 监听相关事件
            const gameStartedSpy = jest.fn();
            eventBus.on('game-started', gameStartedSpy);
            
            // 开始新游戏
            gameEngine.startNewGame();
            
            // 验证游戏状态
            expect(gameEngine.gameState.phase).toBe('PLAYING');
            expect(gameEngine.gameState.players.length).toBe(3);
            expect(gameEngine.gameState.currentPlayerIndex).toBeGreaterThanOrEqual(0);
            expect(gameEngine.gameState.currentPlayerIndex).toBeLessThan(3);
            
            // 验证每个玩家都有牌
            gameEngine.gameState.players.forEach(player => {
                expect(player.cards.length).toBeGreaterThan(0);
            });
            
            // 验证总牌数正确（18+17+17=52）
            const totalCards = gameEngine.gameState.players.reduce((sum, player) => sum + player.cards.length, 0);
            expect(totalCards).toBe(52);
            
            // 验证事件被触发
            expect(gameStartedSpy).toHaveBeenCalled();
            expect(gameStartedSpy.mock.calls[0][0].players).toBe(gameEngine.gameState.players);
            expect(gameStartedSpy.mock.calls[0][0].currentPlayerIndex).toBe(gameEngine.gameState.currentPlayerIndex);
        });
        
        test('新游戏应该重置之前的游戏状态', () => {
            // 先开始一局游戏
            gameEngine.startNewGame();
            const firstGameState = {
                phase: gameEngine.gameState.phase,
                players: [...gameEngine.gameState.players],
                currentPlayerIndex: gameEngine.gameState.currentPlayerIndex
            };
            
            // 模拟一些游戏操作
            gameEngine.gameState.recordValidPlay([new Card('hearts', '10')]);
            gameEngine.gameState.passCount = 1;
            
            // 开始新游戏
            gameEngine.startNewGame();
            
            // 验证状态被重置
            expect(gameEngine.gameState.phase).toBe('PLAYING');
            expect(gameEngine.gameState.lastValidPlay).toBe(null);
            expect(gameEngine.gameState.passCount).toBe(0);
            expect(gameEngine.gameState.winner).toBe(null);
            expect(gameEngine.gameState.loser).toBe(null);
        });
    });
    
    describe('发牌功能测试', () => {
        test('发牌应该平均分配给三个玩家', () => {
            gameEngine.startNewGame();
            
            const playerCards = gameEngine.gameState.players.map(player => player.cards.length);
            
            // 验证发牌数量：18, 17, 17
            expect(playerCards).toContain(18);
            expect(playerCards).toContain(17);
            expect(playerCards.filter(count => count === 17).length).toBe(2);
            
            // 验证所有牌都是唯一的（没有重复）
            const allCards = [];
            gameEngine.gameState.players.forEach(player => {
                allCards.push(...player.cards);
            });
            
            const cardIds = allCards.map(card => `${card.suit}-${card.rank}`);
            const uniqueCardIds = new Set(cardIds);
            expect(uniqueCardIds.size).toBe(52);
        });
        
        test('发牌后卡牌管理器应该为空', () => {
            gameEngine.startNewGame();
            expect(gameEngine.cardManager.cards.length).toBe(0);
        });
        
        test('玩家手牌应该按大小排序', () => {
            gameEngine.startNewGame();
            
            gameEngine.gameState.players.forEach(player => {
                // 验证手牌是按value排序的
                for (let i = 0; i < player.cards.length - 1; i++) {
                    expect(player.cards[i].value).toBeLessThanOrEqual(player.cards[i + 1].value);
                }
            });
        });
    });
    
    describe('不出功能测试', () => {
        test('玩家可以在有前续出牌时选择不出', () => {
            // 开始游戏并设置一个有效出牌
            gameEngine.startNewGame();
            const firstPlayer = gameEngine.gameState.players[0];
            const testCards = [firstPlayer.cards[0]];
            
            // 模拟第一个玩家出牌
            gameEngine.gameState.recordValidPlay(testCards);
            gameEngine.gameState.nextPlayer();
            
            // 第二个玩家选择不出
            const secondPlayer = gameEngine.gameState.players[1];
            const passSpy = jest.fn();
            eventBus.on('player-passed', passSpy);
            
            gameEngine.handlePlayerPass({ player: secondPlayer });
            
            // 验证不出记录
            expect(gameEngine.gameState.passCount).toBe(1);
            expect(passSpy).toHaveBeenCalledWith({
                player: secondPlayer,
                passCount: 1
            });
        });
        
        test('第一个出牌的玩家不能选择不出', () => {
            gameEngine.startNewGame();
            
            const firstPlayer = gameEngine.gameState.getCurrentPlayer();
            const passSpy = jest.fn();
            const invalidPlaySpy = jest.fn();
            
            eventBus.on('player-passed', passSpy);
            eventBus.on('invalid-play', invalidPlaySpy);
            
            // 尝试让第一个玩家不出
            gameEngine.handlePlayerPass({ player: firstPlayer });
            
            // 验证不出没有被记录
            expect(gameEngine.gameState.passCount).toBe(0);
            expect(passSpy).not.toHaveBeenCalled();
        });
        
        test('当所有其他玩家都不出时开始新一轮', () => {
            gameEngine.startNewGame();
            
            // 设置一个有3个玩家的游戏状态
            const firstPlayer = gameEngine.gameState.players[0];
            const secondPlayer = gameEngine.gameState.players[1];
            const thirdPlayer = gameEngine.gameState.players[2];
            
            // 第一个玩家出牌
            const testCards = [firstPlayer.cards[0]];
            gameEngine.handlePlayerPlay({ player: firstPlayer, cards: testCards });
            
            // 第二个和第三个玩家都不出
            const newRoundSpy = jest.fn();
            eventBus.on('new-round', newRoundSpy);
            
            gameEngine.handlePlayerPass({ player: secondPlayer });
            gameEngine.handlePlayerPass({ player: thirdPlayer });
            
            // 验证新一轮开始
            expect(newRoundSpy).toHaveBeenCalled();
            expect(gameEngine.gameState.currentPlayerIndex).toBe(0); // 回到第一个玩家
            expect(gameEngine.gameState.passCount).toBe(0); // pass计数重置
            expect(gameEngine.gameState.lastValidPlay).toBe(null); // 出牌记录重置
        });
        
        test('不出操作应该切换到下一个玩家', () => {
            gameEngine.startNewGame();
            
            // 设置游戏状态
            const firstPlayer = gameEngine.gameState.players[0];
            const secondPlayer = gameEngine.gameState.players[1];
            const testCards = [firstPlayer.cards[0]];
            
            gameEngine.gameState.recordValidPlay(testCards);
            gameEngine.gameState.currentPlayerIndex = 1; // 设置当前为第二个玩家
            
            const turnChangedSpy = jest.fn();
            eventBus.on('turn-changed', turnChangedSpy);
            
            // 第二个玩家不出
            gameEngine.handlePlayerPass({ player: secondPlayer });
            
            // 验证切换到第三个玩家
            expect(gameEngine.gameState.currentPlayerIndex).toBe(2);
            expect(turnChangedSpy).toHaveBeenCalled();
        });
        
        test('非当前玩家不能选择不出', () => {
            gameEngine.startNewGame();
            
            // 设置游戏状态
            const firstPlayer = gameEngine.gameState.players[0];
            const secondPlayer = gameEngine.gameState.players[1];
            const thirdPlayer = gameEngine.gameState.players[2];
            const testCards = [firstPlayer.cards[0]];
            
            gameEngine.gameState.recordValidPlay(testCards);
            gameEngine.gameState.currentPlayerIndex = 1; // 当前是第二个玩家
            
            const passSpy = jest.fn();
            eventBus.on('player-passed', passSpy);
            
            // 尝试让第三个玩家不出（不是他的回合）
            gameEngine.handlePlayerPass({ player: thirdPlayer });
            
            // 验证不出没有被记录
            expect(gameEngine.gameState.passCount).toBe(0);
            expect(passSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('事件订阅测试', () => {
        test('应该正确订阅游戏事件', () => {
            expect(eventBus.events['play-cards']).toBeDefined();
            expect(eventBus.events['pass']).toBeDefined();
            expect(eventBus.events['new-game']).toBeDefined();
            expect(eventBus.events['next-round']).toBeDefined();
            
            expect(eventBus.events['play-cards'].length).toBe(1);
            expect(eventBus.events['pass'].length).toBe(1);
            expect(eventBus.events['new-game'].length).toBe(1);
            expect(eventBus.events['next-round'].length).toBe(1);
        });
        
        test('应该通过事件正确触发新游戏', () => {
            const newGameSpy = jest.fn();
            eventBus.on('game-started', newGameSpy);
            
            // 通过事件触发新游戏
            eventBus.emit('new-game');
            
            // 验证游戏开始事件被触发
            expect(newGameSpy).toHaveBeenCalled();
        });
    });
    
    describe('AI触发测试', () => {
        test('当AI玩家轮到时应该触发AI决策', () => {
            gameEngine.startNewGame();
            
            // 找到AI玩家
            let aiPlayerIndex = -1;
            for (let i = 0; i < gameEngine.gameState.players.length; i++) {
                if (!gameEngine.gameState.players[i].isHuman) {
                    aiPlayerIndex = i;
                    break;
                }
            }
            
            if (aiPlayerIndex !== -1) {
                // 设置当前玩家为AI
                gameEngine.gameState.currentPlayerIndex = aiPlayerIndex;
                
                // 触发AI检查
                gameEngine.checkAndTriggerAIPlay();
                
                // 验证AI管理器的makeDecision被调用
                expect(mockAIManager.makeDecision).toHaveBeenCalled();
            }
        });
    });
});