# 交公粮 (Jiaogongliang)

一个基于 JavaScript 的传统中国卡牌游戏，支持 AI 对战和本地多人游戏。

## 🎮 游戏简介

"交公粮"是一种经典的中国纸牌游戏，玩法类似于"斗地主"，具有独特的地方规则和策略性。本项目提供完整的浏览器端游戏体验，支持智能 AI 对手。

## ✨ 特性

- 🤖 **智能 AI 对手** - 基于策略的 AI 决策系统
- 👥 **多人支持** - 本地多人游戏模式
- 🎴 **完整卡牌系统** - 支持各种牌型和规则判断
- 📱 **响应式设计** - 适配桌面和移动设备
- 🔊 **音效反馈** - 沉浸式游戏体验

## 🚀 快速开始

### 在线试玩

访问 GitHub Pages 链接即可开始游戏：
https://boathell.github.io/jiaogonglaing-games

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/boathell/jiaogonglaing-games.git
cd jiaogonglaing-games

# 启动本地服务器
python3 -m http.server 8000

# 打开浏览器访问
open http://localhost:8000/index.html
```

## 🛠️ 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **测试**: Jest + jsdom
- **构建**: 原生模块化架构，无需复杂构建工具

## 📁 项目结构

```
jiaogonglaing-games/
├── index.html              # 游戏主入口
├── css/
│   └── style-new.css       # 游戏样式
├── js/
│   ├── main-new.js         # 主程序入口
│   ├── GameEngine.js       # 游戏引擎核心
│   ├── AIManager.js        # AI 管理模块
│   ├── UIManager-new.js    # UI 管理模块
│   ├── CardManager.js      # 卡牌管理模块
│   ├── EventBus.js         # 事件总线
│   └── models/             # 数据模型
│       ├── Card.js
│       ├── Player.js
│       └── GameState.js
├── tests/                  # 单元测试
├── .gitleaks.toml          # 敏感信息扫描配置
├── .pre-commit-config.yaml # 代码提交前检查
└── SECURITY.md             # 安全指南
```

## 🧪 测试

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 监视模式
npx jest --watch
```

## 🛡️ 安全措施

本项目配置了多层安全保护：

- **Gitleaks** - 检测 API 密钥、密码等敏感信息
- **Pre-commit Hooks** - 提交前自动安全检查
- **Git Ignore** - 防止敏感文件误提交

安装安全钩子：
```bash
./install-security-hooks.sh
```

## 📝 游戏规则

### 基础规则

1. **发牌**: 每人 17 张牌，留 3 张作为底牌
2. **叫分**: 玩家可选择叫 1/2/3 分或不叫
3. **确定角色**: 最高分者成为地主，获得底牌
4. **出牌**: 地主先出，轮流出牌，必须大于上家
5. **获胜**: 任意一方出完所有牌即获胜

### 牌型说明

- 单张、对子、三张、三带一、三带二
- 顺子（五张及以上连续单牌）
- 连对（三对及以上连续对子）
- 飞机（两个及以上连续三张）
- 炸弹（四张相同点数）
- 王炸（大王+小王）

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 游戏规则参考传统中国民间玩法
- AI 算法基于启发式策略

---

Made with ❤️ by boathell
