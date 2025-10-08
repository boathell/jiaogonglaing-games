/**
 * 事件总线类
 * 负责管理游戏中的事件订阅和发布
 */
class EventBus {
    /**
     * 构造函数
     */
    constructor() {
        this.events = {};
    }

    /**
     * 订阅事件
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * 取消订阅事件
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(eventName, callback) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    /**
     * 发布事件
     * @param {string} eventName - 事件名称
     * @param {Object} data - 事件数据
     */
    emit(eventName, data) {
        console.log(`EventBus.emit: 事件 "${eventName}" 被触发`);
        if (!this.events[eventName]) {
            console.log(`EventBus.emit: 事件 "${eventName}" 没有订阅者`);
            return;
        }
        console.log(`EventBus.emit: 事件 "${eventName}" 有 ${this.events[eventName].length} 个订阅者`);
        this.events[eventName].forEach((callback, index) => {
            console.log(`EventBus.emit: 执行订阅者 ${index + 1}`);
            callback(data);
        });
    }
}