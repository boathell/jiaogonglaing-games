/**
 * 游戏主逻辑
 * 负责初始化游戏和启动游戏
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成');
    
    // 创建事件总线
    const eventBus = new EventBus();
    
    // 创建游戏引擎
    const gameEngine = new GameEngine();
    
    // 创建UI管理器
    const uiManager = new UIManager();
    
    // 创建AI管理器
    const aiManager = new AIManager();
    
    // 初始化各个模块
    aiManager.init(eventBus);
    uiManager.init(gameEngine, eventBus);
    gameEngine.init(uiManager, aiManager, eventBus);
    
    // 绑定新游戏按钮事件
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            console.log('点击新游戏按钮');
            gameEngine.startNewGame();
        });
    } else {
        console.error('找不到新游戏按钮');
    }
    
    // 自动开始第一局游戏
    gameEngine.startNewGame();
    
    console.log('游戏初始化完成');
});