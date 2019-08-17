"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const python_shell_1 = require("python-shell");
exports.InitDoorbellInterface = () => {
    // const scriptPath = path.dirname(__dirname).split(path.sep).pop();
    return new python_shell_1.PythonShell('door-monitor.py', {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'],
        scriptPath: '/usr/lib/node_modules/homebridge-gate-latch/',
    });
};
