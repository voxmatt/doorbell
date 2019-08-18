"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//////////////////////////////
// CONFIG
//////////////////////////////
const gate_latch_interface_1 = require("./gate-latch-interface");
let Service, Characteristic;
// NOTE: these MUST match the string commands in door-monitor.py
var GateLatchCommands;
(function (GateLatchCommands) {
    GateLatchCommands["LatchLock"] = "latch_lock";
    GateLatchCommands["LatchUnlock"] = "latch_unlock";
    GateLatchCommands["LatchStatus"] = "latch_status";
})(GateLatchCommands || (GateLatchCommands = {}));
var GateLatchMessages;
(function (GateLatchMessages) {
    GateLatchMessages["DoorbellIsOn"] = "doorbell_is_on";
    GateLatchMessages["DoorbellIsOff"] = "doorbell_is_off";
})(GateLatchMessages || (GateLatchMessages = {}));
module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-gate-latch", "GateLatch", GateLatch);
};
//////////////////////////////
// GateLatch CLASS
//////////////////////////////
class GateLatch {
    //~-~-~-~-~-~-~-~-~-~-~-~-
    // Constructor
    //~-~-~-~-~-~-~-~-~-~-~-~-
    constructor(log, config) {
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Class Config
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // internal config
        this.latchUnlockPeriod = 10000; // millis = 10 seconds
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Service Setup
        //~-~-~-~-~-~-~-~-~-~-~-~-
        this.createLockService = (name) => {
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
        };
        this.createDoorbellService = (name) => {
            return new Service.Doorbell(name, "Doorbell");
        };
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Private Helpers
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // wrapper for sending a command via PythonShell to the Raspberry Pi
        this.issueCommand = (command) => {
            this.log(`Issuing command to "${command}"`);
            this.gateLatchInterface.send(command);
        };
        this.scheduleUnlockTimeout = () => {
            if (this.latchUnlockTimeout) {
                clearTimeout(this.latchUnlockTimeout);
            }
            this.latchUnlockTimeout = setTimeout(() => {
                this.log('unlock timeout');
                this.lockService.setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);
            }, this.latchUnlockPeriod);
        };
        this.listenToDoor = () => {
            this.log("listening for messages");
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
        };
        this.setLatchTargetState = (value) => {
            switch (value) {
                case Characteristic.LockTargetState.UNSECURED:
                    this.latchUnlock();
                    break;
                case Characteristic.LockTargetState.SECURED:
                    this.latchLock();
                    break;
            }
        };
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Public Interface
        //~-~-~-~-~-~-~-~-~-~-~-~-
        this.latchUnlock = () => {
            this.issueCommand(GateLatchCommands.LatchUnlock);
            this.lockService.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
            this.scheduleUnlockTimeout();
        };
        this.latchLock = () => {
            this.issueCommand(GateLatchCommands.LatchLock);
            this.lockService.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
        };
        this.doorbellPress = () => {
            this.doorbellService
                .setCharacteristic(Characteristic.ProgrammableSwitchEvent, Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
        };
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Expose it to Homebridge
        //~-~-~-~-~-~-~-~-~-~-~-~-
        this.getServices = () => {
            // doorbells are now required to have a camera, speaker, and mic
            const pseudoCam = new Service.CameraRTPStreamManagement(this.name, 'Pseudo-Camera');
            const pseudoSpeaker = new Service.Speaker(this.name, 'Pseudo-Speaker');
            const pseudoMic = new Service.Microphone(this.name, 'Pseudo-Microphone');
            return [
                this.lockService,
                this.doorbellService,
                pseudoCam,
                pseudoSpeaker,
                pseudoMic,
            ];
        };
        this.log = log;
        this.name = config["name"];
        this.gateLatchInterface = gate_latch_interface_1.InitGateLatchInterface();
        this.listenToDoor();
        this.lockService = this.createLockService(this.name);
        this.doorbellService = this.createDoorbellService(this.name);
    }
}
