"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function callbackify(func) {
    return (...args) => {
        const onlyArgs = [];
        let maybeCallback = null;
        for (const arg of args) {
            if (typeof arg === 'function') {
                maybeCallback = arg;
                break;
            }
            onlyArgs.push(arg);
        }
        if (!maybeCallback) {
            throw new Error("Missing callback parameter!");
        }
        const callback = maybeCallback;
        func(...onlyArgs)
            .then((data) => callback(null, data))
            .catch((err) => callback(err));
    };
}
exports.callbackify = callbackify;
