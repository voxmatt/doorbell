"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const python_shell_1 = require("python-shell");
const path_1 = __importDefault(require("path"));
exports.InitDoorbellInterface = () => {
    const scriptPath = path_1.default.dirname(__dirname).split(path_1.default.sep).pop();
    return new python_shell_1.PythonShell('door-monitor.py', {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'],
        scriptPath,
    });
};
