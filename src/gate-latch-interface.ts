import { PythonShell } from 'python-shell'

export const InitGateLatchInterface = () => {
  const pyShell = new PythonShell('gate-latch-monitor.py', {
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    pythonOptions: ['-u'],
    scriptPath: `${__dirname}/`,
  });
  // make sure to terminate the gate-latch-monitor process when the Homebridge process exits
  process.on('exit', () => pyShell.terminate());
  return pyShell;
}
