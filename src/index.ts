import {PythonShell} from 'python-shell'
let Service, Characteristic;

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-hobby-doorbell", "Doorbell", Doorbell);
}

class Doorbell {
  // internal config
  private lockTimeout = 10000; // millis = 10 seconds
  // class variables
  private log: Function;
  private name: string;
  private pyShell: PythonShell;

  constructor(log, config) {
    this.log = log;
    this.name = config["name"];

    const pyShell = new PythonShell('../door-server.py', {
      mode: 'text',
      pythonPath: '/usr/bin/python3',
      pythonOptions: ['-u'],
      scriptPath: 'python/',
    });
    pyShell
  }

  public getState = (callback) => {
    this.log('Getting current state...');
    this.pyShell
  }
}