"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const python_shell_1 = require("python-shell");
exports.InitGateLatchInterface = () => {
    return new python_shell_1.PythonShell('gate-latch-monitor.py', {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'],
        scriptPath: `${__dirname}/`,
    });
};
