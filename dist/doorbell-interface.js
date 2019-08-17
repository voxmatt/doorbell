"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const python_shell_1 = require("python-shell");
exports.InitDoorbellInterface = () => {
    return new python_shell_1.PythonShell('door-monitor.py', {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'],
        scriptPath: '../',
    });
};
