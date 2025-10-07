/**
 * 游戏主逻辑 - 重写版
 * 负责初始化游戏和启动游戏
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成 - 开始初始化游戏');
    
    try {
        // 创建事件总线
        const eventBus = new EventBus();
        console.log('事件总线创建成功');
        
        // 创建游戏引擎
        const gameEngine = new GameEngine();
        console.log('游戏引擎创建成功');
        
        // 创建UI管理器（使用新的重写版）
        const uiManager = new UIManager();
        console.log('UI管理器创建成功');
        
        // 创建AI管理器
        const aiManager = new AIManager();
        console.log('AI管理器创建成功');
        
        // 初始化各个模块
        aiManager.init(eventBus);
        console.log('AI管理器初始化完成');
        
        uiManager.init(gameEngine, eventBus);
        console.log('UI管理器初始化完成');
        
        gameEngine.init(uiManager, aiManager, eventBus);
        console.log('游戏引擎初始化完成');
        
        // 绑定新游戏按钮事件
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('点击新游戏按钮');
                gameEngine.startNewGame();
            });
            console.log('新游戏按钮事件绑定成功');
        } else {
            console.error('找不到新游戏按钮');
        }
        
        // 自动开始第一局游戏
        console.log('准备开始新游戏...');
        setTimeout(() => {
            gameEngine.startNewGame();
            console.log('新游戏已开始');
        }, 500);
        
        console.log('游戏初始化全部完成');
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        alert('游戏初始化失败: ' + error.message);
    }
});