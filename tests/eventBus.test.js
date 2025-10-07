/**
 * EventBus类的单元测试
 */

describe('EventBus类测试', () => {
    // 测试EventBus类的构造函数
    test('EventBus构造函数应该正确初始化', () => {
        const eventBus = new EventBus();
        
        expect(eventBus.events).toEqual({});
    });
    
    // 测试订阅事件
    test('on方法应该正确订阅事件', () => {
        const eventBus = new EventBus();
        const callback = jest.fn();
        
        eventBus.on('test-event', callback);
        
        expect(eventBus.events['test-event']).toBeDefined();
        expect(eventBus.events['test-event'].length).toBe(1);
        expect(eventBus.events['test-event'][0]).toBe(callback);
    });
    
    // 测试取消订阅事件
    test('off方法应该正确取消订阅事件', () => {
        const eventBus = new EventBus();
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        
        eventBus.on('test-event', callback1);
        eventBus.on('test-event', callback2);
        
        expect(eventBus.events['test-event'].length).toBe(2);
        
        eventBus.off('test-event', callback1);
        
        expect(eventBus.events['test-event'].length).toBe(1);
        expect(eventBus.events['test-event'][0]).toBe(callback2);
    });
    
    // 测试发布事件
    test('emit方法应该正确触发事件回调', () => {
        const eventBus = new EventBus();
        const callback = jest.fn();
        const data = { test: 'data' };
        
        eventBus.on('test-event', callback);
        eventBus.emit('test-event', data);
        
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(data);
    });
    
    // 测试多个回调
    test('emit方法应该触发所有订阅的回调', () => {
        const eventBus = new EventBus();
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const data = { test: 'data' };
        
        eventBus.on('test-event', callback1);
        eventBus.on('test-event', callback2);
        
        eventBus.emit('test-event', data);
        
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback1).toHaveBeenCalledWith(data);
        expect(callback2).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledWith(data);
    });
    
    // 测试未订阅的事件
    test('emit方法对未订阅的事件不应该有任何操作', () => {
        const eventBus = new EventBus();
        
        // 不应该抛出错误
        expect(() => {
            eventBus.emit('non-existent-event', {});
        }).not.toThrow();
    });
});