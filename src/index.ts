import { InitDoorbellInterface } from './doorbell-interface';

let Service, Characteristic;

// NOTE: these MUST match the string commands in door-monitor.py
enum DoorbellCommands {
  Lock = 'lock',
  Unlock = 'unlock'
}

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
  private doorbellInterface: ReturnType<typeof InitDoorbellInterface>;

  constructor(log, config) {
    this.log = log;
    this.name = config["name"];
    this.doorbellInterface = InitDoorbellInterface();
  }

  public lock = () => {
    this.log('Getting current state...');
    this.doorbellInterface.send('lock');
  }
}