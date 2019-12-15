let setImmediateCallbacks = [];

global.setImmediate = global.requestAnimationFrame = function (fn) {
    setImmediateCallbacks.push(fn);
};

global.setImmediateExec = function () {
    setImmediateCallbacks.forEach(fn => fn());
    setImmediateCallbacks = [];
};
