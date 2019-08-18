import { PythonShell } from 'python-shell'
import path from 'path';

export const InitGateLatchInterface = () => {
  // const scriptPath = path.dirname(__dirname).split(path.sep).pop();
  return new PythonShell('gate-latch-monitor.py', {
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    pythonOptions: ['-u'],
    scriptPath: '/usr/lib/node_modules/homebridge-gate-latch/dist/',  
  });
}
