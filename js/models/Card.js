/**
 * 卡牌类
 * 表示游戏中的一张扑克牌
 */
class Card {
    /**
     * 构造函数
     * @param {string} suit - 花色 (spade-黑桃, heart-红桃, club-梅花, diamond-方块, joker-王牌)
     * @param {string} rank - 点数 (3-10, J, Q, K, A, 2, joker1-小王, joker2-大王)
     * @param {number} value - 牌的大小值
     */
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
        this.selected = false;
        this.x = 0;
        this.y = 0;
        this.width = 80;
        this.height = 120;
        this.image = null;
        this.loadImage();
    }

    /**
     * 加载卡牌图片
     */
    loadImage() {
        // 在实际实现中，这里会加载对应的卡牌图片
        // 简化版本中，我们暂时不实现具体的图片加载
        this.image = new Image();
        
        if (this.suit === 'joker') {
            this.image.src = `assets/cards/${this.rank}.png`;
        } else {
            this.image.src = `assets/cards/${this.suit}_${this.rank}.png`;
        }
    }

    /**
     * 设置卡牌位置
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 切换卡牌选中状态
     */
    toggleSelect() {
        this.selected = !this.selected;
    }

    /**
     * 判断点击是否在卡牌上
     * @param {number} x - 点击的x坐标
     * @param {number} y - 点击的y坐标
     * @returns {boolean} - 是否点击在卡牌上
     */
    isClicked(x, y) {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }

    /**
     * 获取卡牌的显示名称
     * @returns {string} - 卡牌显示名称
     */
    getDisplayName() {
        if (this.suit === 'joker') {
            return this.rank === 'joker1' ? '小王' : '大王';
        }
        
        const suitNames = {
            'spade': '♠',
            'heart': '♥',
            'club': '♣',
            'diamond': '♦'
        };
        
        const rankNames = {
            '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', '10': '10', 'J': 'J', 'Q': 'Q',
            'K': 'K', 'A': 'A', '2': '2'
        };
        
        return `${suitNames[this.suit]}${rankNames[this.rank]}`;
    }
}