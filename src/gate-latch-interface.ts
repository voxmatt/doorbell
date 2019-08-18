import { PythonShell } from 'python-shell'

export const InitGateLatchInterface = () => {
  return new PythonShell('gate-latch-monitor.py', {
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    pythonOptions: ['-u'],
    scriptPath: `${__dirname}/`,
  });
}
