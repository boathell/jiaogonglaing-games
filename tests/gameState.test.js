/**
 * GameState类的单元测试
 */

describe('GameState类测试', () => {
    // 测试GameState类的构造函数
    test('GameState构造函数应该正确初始化游戏状态', () => {
        const gameState = new GameState();
        
        expect(gameState.players).toEqual([]);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.phase).toBe('INIT');
        expect(gameState.lastValidPlay).toBe(null);
        expect(gameState.lastValidPlayIndex).toBe(-1);
        expect(gameState.passCount).toBe(0);
        expect(gameState.winner).toBe(null);
        expect(gameState.loser).toBe(null);
        expect(gameState.needTribute).toBe(false);
    });
    
    // 测试初始化玩家
    test('initPlayers方法应该正确初始化玩家列表', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        
        gameState.initPlayers([player1, player2]);
        
        expect(gameState.players.length).toBe(2);
        expect(gameState.players[0]).toBe(player1);
        expect(gameState.players[1]).toBe(player2);
    });
    
    // 测试获取当前玩家
    test('getCurrentPlayer方法应该返回当前玩家', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        
        gameState.initPlayers([player1, player2]);
        gameState.currentPlayerIndex = 1;
        
        expect(gameState.getCurrentPlayer()).toBe(player2);
    });
    
    // 测试切换到下一个玩家
    test('nextPlayer方法应该正确切换到下一个玩家', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        const player3 = new Player('2', '玩家3', false);
        
        gameState.initPlayers([player1, player2, player3]);
        
        // 初始为玩家1
        expect(gameState.currentPlayerIndex).toBe(0);
        
        // 切换到玩家2
        gameState.nextPlayer();
        expect(gameState.currentPlayerIndex).toBe(1);
        
        // 切换到玩家3
        gameState.nextPlayer();
        expect(gameState.currentPlayerIndex).toBe(2);
        
        // 切换回玩家1
        gameState.nextPlayer();
        expect(gameState.currentPlayerIndex).toBe(0);
    });
    
    // 测试记录有效出牌
    test('recordValidPlay方法应该正确记录有效出牌', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        
        gameState.initPlayers([player1, player2]);
        
        const cards = [new Card('hearts', '10')];
        
        gameState.recordValidPlay(cards);
        
        expect(gameState.lastValidPlay).toBe(cards);
        expect(gameState.lastValidPlayIndex).toBe(0);
        expect(gameState.passCount).toBe(0);
    });
    
    // 测试记录不出
    test('recordPass方法应该正确记录不出', () => {
        const gameState = new GameState();
        
        gameState.recordPass();
        
        expect(gameState.passCount).toBe(1);
        
        gameState.recordPass();
        
        expect(gameState.passCount).toBe(2);
    });
    
    // 测试重置出牌记录
    test('resetPlayRecord方法应该正确重置出牌记录', () => {
        const gameState = new GameState();
        const cards = [new Card('hearts', '10')];
        
        gameState.lastValidPlay = cards;
        gameState.lastValidPlayIndex = 1;
        gameState.passCount = 2;
        
        gameState.resetPlayRecord();
        
        expect(gameState.lastValidPlay).toBe(null);
        expect(gameState.lastValidPlayIndex).toBe(-1);
        expect(gameState.passCount).toBe(0);
    });
    
    // 测试检查游戏结束
    test('checkGameEnd方法在玩家没有牌时应该返回true', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        
        gameState.initPlayers([player1, player2]);
        
        // 玩家1有牌，玩家2没有牌
        player1.cards = [new Card('hearts', '10')];
        player2.cards = [];
        
        gameState.currentPlayerIndex = 1; // 当前是玩家2
        
        const result = gameState.checkGameEnd();
        
        expect(result).toBe(true);
        expect(gameState.winner).toBe(player2);
        
        // 检查是否需要交粮
        expect(gameState.needTribute).toBe(true);
        expect(gameState.loser).toBe(player1);
    });
    
    // 测试检查游戏未结束
    test('checkGameEnd方法在所有玩家都有牌时应该返回false', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        
        gameState.initPlayers([player1, player2]);
        
        // 两个玩家都有牌
        player1.cards = [new Card('hearts', '10')];
        player2.cards = [new Card('spades', '5')];
        
        const result = gameState.checkGameEnd();
        
        expect(result).toBe(false);
        expect(gameState.winner).toBe(null);
        expect(gameState.loser).toBe(null);
        expect(gameState.needTribute).toBe(false);
    });
    
    // 测试设置游戏阶段
    test('setPhase方法应该正确设置游戏阶段', () => {
        const gameState = new GameState();
        
        gameState.setPhase('PLAYING');
        
        expect(gameState.phase).toBe('PLAYING');
        
        gameState.setPhase('TRIBUTE');
        
        expect(gameState.phase).toBe('TRIBUTE');
    });
    
    // 测试重置游戏状态
    test('reset方法应该正确重置游戏状态', () => {
        const gameState = new GameState();
        const player1 = new Player('0', '玩家1', true);
        const player2 = new Player('1', '玩家2', false);
        
        gameState.initPlayers([player1, player2]);
        gameState.currentPlayerIndex = 1;
        gameState.phase = 'PLAYING';
        gameState.lastValidPlay = [new Card('hearts', '10')];
        gameState.lastValidPlayIndex = 0;
        gameState.passCount = 2;
        gameState.winner = player1;
        gameState.loser = player2;
        gameState.needTribute = true;
        
        gameState.reset();
        
        // 玩家列表应该保持不变
        expect(gameState.players.length).toBe(2);
        expect(gameState.players[0]).toBe(player1);
        expect(gameState.players[1]).toBe(player2);
        
        // 其他状态应该重置
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.phase).toBe('INIT');
        expect(gameState.lastValidPlay).toBe(null);
        expect(gameState.lastValidPlayIndex).toBe(-1);
        expect(gameState.passCount).toBe(0);
        expect(gameState.winner).toBe(null);
        expect(gameState.loser).toBe(null);
        expect(gameState.needTribute).toBe(false);
    });
});