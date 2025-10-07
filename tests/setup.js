/**
 * 测试环境设置文件
 */

// 模拟DOM环境
global.document = {
  createElement: () => ({
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    appendChild: () => {},
    dataset: {}
  }),
  getElementById: () => ({
    innerHTML: '',
    style: {},
    classList: {
      add: () => {},
      remove: () => {}
    },
    appendChild: () => {},
    addEventListener: () => {}
  })
};

// 模拟Image对象
global.Image = class {
  constructor() {
    this.src = '';
  }
};

// 模拟setTimeout
global.setTimeout = (callback, delay) => {
  callback();
  return 1;
};

// 定义全局的jest mock函数
global.jest = {
  fn: () => {
    const mockFn = function() {
      mockFn.calls.push(arguments);
      return mockFn.returnValue;
    };
    mockFn.calls = [];
    mockFn.returnValue = undefined;
    mockFn.mockReturnValue = function(val) {
      mockFn.returnValue = val;
      return mockFn;
    };
    mockFn.mockImplementation = function(fn) {
      const originalReturnValue = mockFn.returnValue;
      mockFn.returnValue = undefined;
      const newFn = function() {
        newFn.calls.push(arguments);
        if (fn) {
          return fn.apply(this, arguments);
        }
        return originalReturnValue;
      };
      newFn.calls = [];
      newFn.returnValue = originalReturnValue;
      newFn.mockReturnValue = mockFn.mockReturnValue;
      newFn.mockImplementation = mockFn.mockImplementation;
      return newFn;
    };
    return mockFn;
  }
};