/**
 * AI流程诊断工具
 * 用于检查AI是否知道轮到它出牌
 */

class AIDebugFlow {
    constructor() {
        this.logs = [];
        this.originalConsoleLog = console.log;
        this.originalConsoleError = console.error;
        this.hookConsole();
    }
    
    hookConsole() {
        console.log = (...args) => {
            const message = args.join(' ');
            this.originalConsoleLog.apply(console, args);
            this.addLog('LOG', message);
        };
        
        console.error = (...args) => {
            const message = args.join(' ');
            this.originalConsoleError.apply(console, args);
            this.addLog('ERROR', message);
        };
    }
    
    addLog(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({
            timestamp,
            level,
            message,
            stack: new Error().stack
        });
        
        // 保持日志数量在合理范围内
        if (this.logs.length > 1000) {
            this.logs.shift();
        }
    }
    
    analyzeAIFlow() {
        const analysis = {
            gameStart: [],
            playerPlays: [],
            turnChanges: [],
            aiTriggers: [],
            aiDecisions: [],
            errors: []
        };
        
        this.logs.forEach(log => {
            const msg = log.message;
            
            if (msg.includes('GameEngine.startNewGame')) {
                analysis.gameStart.push(log);
            } else if (msg.includes('handlePlayerPlay') || msg.includes('play-cards')) {
                analysis.playerPlays.push(log);
            } else if (msg.includes('turn-changed') || msg.includes('切换到下一个玩家')) {
                analysis.turnChanges.push(log);
            } else if (msg.includes('checkAndTriggerAIPlay') || msg.includes('触发AI')) {
                analysis.aiTriggers.push(log);
            } else if (msg.includes('AI决策') || msg.includes('makeDecision')) {
                analysis.aiDecisions.push(log);
            } else if (log.level === 'ERROR' || msg.includes('错误')) {
                analysis.errors.push(log);
            }
        });
        
        return analysis;
    }
    
    getDiagnosticReport() {
        const analysis = this.analyzeAIFlow();
        const report = [];
        
        report.push('=== AI流程诊断报告 ===');
        report.push(`诊断时间: ${new Date().toLocaleString()}`);
        report.push(`总日志条数: ${this.logs.length}`);
        report.push('');
        
        // 检查游戏开始
        if (analysis.gameStart.length === 0) {
            report.push('❌ 问题: 游戏未正确开始');
        } else {
            report.push('✅ 游戏开始正常');
        }
        
        // 检查玩家出牌
        if (analysis.playerPlays.length === 0) {
            report.push('⚠️  警告: 未检测到玩家出牌事件');
        } else {
            report.push(`✅ 检测到 ${analysis.playerPlays.length} 次玩家出牌`);
        }
        
        // 检查回合切换
        if (analysis.turnChanges.length === 0) {
            report.push('❌ 问题: 回合切换事件未触发');
        } else {
            report.push(`✅ 检测到 ${analysis.turnChanges.length} 次回合切换`);
        }
        
        // 检查AI触发
        if (analysis.aiTriggers.length === 0) {
            report.push('❌ 严重问题: AI从未被触发！');
        } else {
            report.push(`✅ 检测到 ${analysis.aiTriggers.length} 次AI触发`);
        }
        
        // 检查AI决策
        if (analysis.aiDecisions.length === 0) {
            report.push('❌ 问题: AI未做出任何决策');
        } else {
            report.push(`✅ 检测到 ${analysis.aiDecisions.length} 次AI决策`);
        }
        
        // 检查错误
        if (analysis.errors.length > 0) {
            report.push(`❌ 发现 ${analysis.errors.length} 个错误`);
        }
        
        report.push('');
        report.push('=== 详细流程分析 ===');
        
        // 按时间顺序显示关键事件
        const allEvents = [
            ...analysis.gameStart.map(l => ({...l, type: '游戏开始'})),
            ...analysis.playerPlays.map(l => ({...l, type: '玩家出牌'})),
            ...analysis.turnChanges.map(l => ({...l, type: '回合切换'})),
            ...analysis.aiTriggers.map(l => ({...l, type: 'AI触发'})),
            ...analysis.aiDecisions.map(l => ({...l, type: 'AI决策'}))
        ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        
        if (allEvents.length === 0) {
            report.push('⚠️  没有足够的数据进行分析');
        } else {
            allEvents.forEach(event => {
                report.push(`[${event.timestamp}] ${event.type}: ${event.message}`);
            });
        }
        
        return report.join('\n');
    }
    
    exportLogs() {
        return {
            logs: this.logs,
            analysis: this.analyzeAIFlow(),
            diagnosticReport: this.getDiagnosticReport(),
            exportTime: new Date().toISOString()
        };
    }
    
    clearLogs() {
        this.logs = [];
    }
}

// 创建全局调试实例
window.aiDebugFlow = new AIDebugFlow();

// 添加便捷的调试函数
window.showAIDIagnostic = function() {
    const report = window.aiDebugFlow.getDiagnosticReport();
    console.log(report);
    return report;
};

window.exportAIDIagnostic = function() {
    const data = window.aiDebugFlow.exportLogs();
    console.log('AI诊断数据已导出:', data);
    return data;
};

console.log('🔍 AI流程诊断工具已加载');
console.log('使用方法:');
console.log('- showAIDIagnostic() - 显示诊断报告');
console.log('- exportAIDIagnostic() - 导出完整诊断数据');