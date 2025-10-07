// DOM调试脚本 - 用于检查实际的卡片布局
(function() {
    'use strict';
    
    function analyzeLayout() {
        console.log('=== DOM布局分析开始 ===');
        
        // 检查玩家区域
        const playerAreas = document.querySelectorAll('.player-area');
        console.log(`找到 ${playerAreas.length} 个玩家区域`);
        
        playerAreas.forEach((area, index) => {
            const playerId = area.id;
            const playerCards = area.querySelector('.player-cards');
            const cards = area.querySelectorAll('.card');
            
            console.log(`\n玩家区域 ${index}: ${playerId}`);
            console.log(`- 玩家卡片容器:`, playerCards);
            console.log(`- 容器CSS类:`, playerCards ? playerCards.className : '无');
            console.log(`- 容器样式:`, playerCards ? playerCards.style.cssText : '无');
            console.log(`- 找到 ${cards.length} 张卡片`);
            
            if (playerCards) {
                const computedStyle = window.getComputedStyle(playerCards);
                console.log(`- 容器display: ${computedStyle.display}`);
                console.log(`- 容器flex-direction: ${computedStyle.flexDirection}`);
                console.log(`- 容器justify-content: ${computedStyle.justifyContent}`);
                console.log(`- 容器align-items: ${computedStyle.alignItems}`);
                console.log(`- 容器宽度: ${computedStyle.width}`);
                console.log(`- 容器高度: ${computedStyle.height}`);
            }
            
            // 检查每张卡片
            cards.forEach((card, cardIndex) => {
                const computedStyle = window.getComputedStyle(card);
                console.log(`  卡片 ${cardIndex}: ${card.textContent || card.innerHTML}`);
                console.log(`  - display: ${computedStyle.display}`);
                console.log(`  - position: ${computedStyle.position}`);
                console.log(`  - margin: ${computedStyle.margin}`);
                console.log(`  - width: ${computedStyle.width} x height: ${computedStyle.height}`);
                console.log(`  - 类名: ${card.className}`);
            });
        });
        
        console.log('\n=== DOM布局分析结束 ===');
    }
    
    // 页面加载完成后分析
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', analyzeLayout);
    } else {
        analyzeLayout();
    }
    
    // 也绑定到按钮上方便重复检查
    window.analyzeLayout = analyzeLayout;
})();