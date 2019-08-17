//////////////////////////////
// CONFIG
//////////////////////////////
import { InitDoorbellInterface } from './doorbell-interface';
let Service, Characteristic;

// NOTE: these MUST match the string commands in door-monitor.py
enum GateLatchCommands {
  LatchLock = 'latch_lock',
  LatchUnlock = 'latch_unlock',
  LatchStatus = 'latch_status'
}

enum GateLatchMessages {
  LatchIsUnlocked = 'latch_is_unlocked',
  LatchIsLocked = 'latch_is_locked',
  DoorbellIsOn = 'doorbell_is_on',
  DoorbellIsOff = 'doorbell_is_off',
}

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-gate-latch", "GateLatch", GateLatch);
}


//////////////////////////////
// GateLatch CLASS
//////////////////////////////
class GateLatch {
  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Class Config
  //~-~-~-~-~-~-~-~-~-~-~-~-
  // internal config
  private latchUnlockPeriod = 10000; // millis = 10 seconds
  private latchUnlockTimeout: NodeJS.Timeout | undefined;
  // class variables
  private log: Function;
  private name: string;
  private doorbellInterface: ReturnType<typeof InitDoorbellInterface>;
  private lockService: any;

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Constructor
  //~-~-~-~-~-~-~-~-~-~-~-~-
  constructor(log, config) {
    this.log = log;
    this.name = config["name"];
    this.doorbellInterface = InitDoorbellInterface();
    this.listenToDoor();
    this.lockService = this.createLockService(this.name);
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Service Setup
  //~-~-~-~-~-~-~-~-~-~-~-~-
  private createLockService = (name: string) => {
    const lockService = new Service.LockMechanism(this.name, "Gate");
    lockService
      .setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED) // force initial state
      .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED)
      .getCharacteristic(Characteristic.LockTargetState)
      .on('set', (value, callback) => {
        this.setLatchTargetState(value);
        callback();
      });
    return lockService;
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Private Helpers
  //~-~-~-~-~-~-~-~-~-~-~-~-
  // wrapper for sending a command via PythonShell to the Raspberry Pi
  private issueCommand = (command: GateLatchCommands) => {
    this.log(`Issuing command to "${command}"`);
    this.doorbellInterface.send(command);
  }

  private scheduleUnlockTimeout = () => {
    if (this.latchUnlockTimeout) {
      clearTimeout(this.latchUnlockTimeout);
    }
    this.latchUnlockTimeout = setTimeout(() => {
      this.log('unlock timeout');
      this.lockService.setCharacteristic(Characteristic.LockTargetState,
        Characteristic.LockTargetState.SECURED);
    }, this.latchUnlockPeriod);
  }

  private listenToDoor = () => {
    this.doorbellInterface.on('message', (message) => {
      this.log(message);
    });
  }

  private setLatchTargetState = (value) => {
    switch (value) {
      case Characteristic.LockTargetState.UNSECURED:
        this.latchUnlock();
        break;
      case Characteristic.LockTargetState.SECURED:
        this.latchLock();
        break;
    }
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Public Interface
  //~-~-~-~-~-~-~-~-~-~-~-~-
  public latchUnlock = () => {
    this.issueCommand(GateLatchCommands.LatchUnlock);
    this.lockService.setCharacteristic(Characteristic.LockCurrentState,
      Characteristic.LockCurrentState.UNSECURED);
    this.scheduleUnlockTimeout();
  }
  
  public latchLock = () => {
    this.issueCommand(GateLatchCommands.LatchLock);
    this.lockService.setCharacteristic(Characteristic.LockCurrentState,
      Characteristic.LockCurrentState.SECURED);
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Expose it to Homebridge
  //~-~-~-~-~-~-~-~-~-~-~-~-
  public getServices = () => {
    return [this.lockService];
  }
}