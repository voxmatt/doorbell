//////////////////////////////
// CONFIG
//////////////////////////////
import { InitGateLatchInterface } from './gate-latch-interface';
let Service, Characteristic;

// NOTE: these MUST match the string commands in door-monitor.py
enum GateLatchCommands {
  LatchLock = 'latch_lock',
  LatchUnlock = 'latch_unlock',
  LatchStatus = 'latch_status'
}

enum GateLatchMessages {
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
  private gateLatchInterface: ReturnType<typeof InitGateLatchInterface>;
  private lockService: any;
  private doorbellService: any;

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Constructor
  //~-~-~-~-~-~-~-~-~-~-~-~-
  constructor(log, config) {
    this.log = log;
    this.name = config["name"];
    this.gateLatchInterface = InitGateLatchInterface();
    this.listenToDoor();
    this.lockService = this.createLockService(this.name);
    this.doorbellService = this.createDoorbellService(this.name);
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Service Setup
  //~-~-~-~-~-~-~-~-~-~-~-~-
  private createLockService = (name: string) => {
    const lockService = new Service.LockMechanism(name, "Gate");
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

  private createDoorbellService = (name: string) => {
    return new Service.Doorbell(name, "Doorbell");
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Private Helpers
  //~-~-~-~-~-~-~-~-~-~-~-~-
  // wrapper for sending a command via PythonShell to the Raspberry Pi
  private issueCommand = (command: GateLatchCommands) => {
    this.log(`Issuing command to "${command}"`);
    this.gateLatchInterface.send(command);
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
    this.log("listening for messages")
    this.gateLatchInterface.on('message', (message) => {
      switch (message) {
        case GateLatchMessages.DoorbellIsOff:
          this.log('doorbell stopped ringing');
          return;
        case GateLatchMessages.DoorbellIsOn:
          this.log('doorbell is ringing');
          this.doorbellPress();
          return;
        default:
          this.log(message);
          return;
      }
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

  public doorbellPress = () => {
    this.doorbellService
      .setCharacteristic(Characteristic.ProgrammableSwitchEvent,
        Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
  }

  //~-~-~-~-~-~-~-~-~-~-~-~-
  // Expose it to Homebridge
  //~-~-~-~-~-~-~-~-~-~-~-~-
  public getServices = () => {
    // doorbells are now required to have a camera, speaker, and mic
    const pseudoCam = new Service.CameraRTPStreamManagement(this.name, 'Pseudo-Camera');
    const pseudoSpeaker  = new Service.Speaker(this.name, 'Pseudo-Speaker');
    const pseudoMic  = new Service.Microphone(this.name, 'Pseudo-Microphone');

    return [
      this.lockService,
      this.doorbellService,
      pseudoCam,
      pseudoSpeaker,
      pseudoMic,
    ];
  }
}