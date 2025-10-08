// 调试当前卡片显示问题
(function() {
    'use strict';
    
    function debugCurrentCards() {
        console.log('=== 开始调试当前卡片显示问题 ===');
        
        // 检查所有玩家区域
        const playerAreas = document.querySelectorAll('.player-area');
        console.log(`找到 ${playerAreas.length} 个玩家区域`);
        
        playerAreas.forEach((area, index) => {
            const playerName = area.querySelector('.player-name')?.textContent || `玩家${index}`;
            const isHuman = area.classList.contains('human-player');
            const isComputer = area.classList.contains('computer-player');
            
            console.log(`\n玩家区域 ${index}: ${playerName}`);
            console.log(`  - 是否人类玩家: ${isHuman}`);
            console.log(`  - 是否电脑玩家: ${isComputer}`);
            
            const cards = area.querySelectorAll('.card');
            console.log(`  - 找到 ${cards.length} 张卡片`);
            
            cards.forEach((card, cardIndex) => {
                console.log(`  卡片 ${cardIndex + 1}:`);
                console.log(`    - data-suit: ${card.dataset.suit}`);
                console.log(`    - data-rank: ${card.dataset.rank}`);
                console.log(`    - 类名: ${card.className}`);
                console.log(`    - innerHTML: "${card.innerHTML}"`);
                
                // 检查子元素
                const suitElement = card.querySelector('.card-suit');
                const rankElement = card.querySelector('.card-rank');
                
                console.log(`    - 花色元素存在: ${!!suitElement}`);
                console.log(`    - 数字元素存在: ${!!rankElement}`);
                
                if (suitElement) {
                    console.log(`    - 花色内容: "${suitElement.textContent}"`);
                    console.log(`    - 花色样式: ${suitElement.style.cssText}`);
                    console.log(`    - 花色计算颜色: ${window.getComputedStyle(suitElement).color}`);
                }
                
                if (rankElement) {
                    console.log(`    - 数字内容: "${rankElement.textContent}"`);
                    console.log(`    - 数字样式: ${rankElement.style.cssText}`);
                    console.log(`    - 数字计算颜色: ${window.getComputedStyle(rankElement).color}`);
                }
                
                // 检查是否被隐藏
                const cardComputed = window.getComputedStyle(card);
                const suitComputed = suitElement ? window.getComputedStyle(suitElement) : null;
                const rankComputed = rankElement ? window.getComputedStyle(rankElement) : null;
                
                console.log(`    - 卡片display: ${cardComputed.display}`);
                console.log(`    - 卡片visibility: ${cardComputed.visibility}`);
                if (suitComputed) {
                    console.log(`    - 花色display: ${suitComputed.display}`);
                    console.log(`    - 花色visibility: ${suitComputed.visibility}`);
                    console.log(`    - 花色font-size: ${suitComputed.fontSize}`);
                }
                if (rankComputed) {
                    console.log(`    - 数字display: ${rankComputed.display}`);
                    console.log(`    - 数字visibility: ${rankComputed.visibility}`);
                    console.log(`    - 数字font-size: ${rankComputed.fontSize}`);
                }
            });
        });
        
        console.log('=== 调试完成 ===');
    }
    
    // 延迟执行，等待页面完全加载
    setTimeout(debugCurrentCards, 2000);
    
    // 也绑定到window供手动调用
    window.debugCurrentCards = debugCurrentCards;
})();