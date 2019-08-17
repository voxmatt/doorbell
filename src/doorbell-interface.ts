import { PythonShell } from 'python-shell'
import path from 'path';

export const InitDoorbellInterface = () => {
  const scriptPath = path.dirname(__dirname).split(path.sep).pop();
  return new PythonShell('door-monitor.py', {
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    pythonOptions: ['-u'],
    scriptPath,  
  });
}
