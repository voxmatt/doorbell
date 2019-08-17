"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//////////////////////////////
// CONFIG
//////////////////////////////
const doorbell_interface_1 = require("./doorbell-interface");
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
    GateLatchMessages["LatchIsUnlocked"] = "latch_is_unlocked";
    GateLatchMessages["LatchIsLocked"] = "latch_is_locked";
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
        };
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Private Helpers
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // wrapper for sending a command via PythonShell to the Raspberry Pi
        this.issueCommand = (command) => {
            this.log(`Issuing command to "${command}"`);
            this.doorbellInterface.send(command);
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
            this.doorbellInterface.on('message', (message) => {
                this.log(message);
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
        //~-~-~-~-~-~-~-~-~-~-~-~-
        // Expose it to Homebridge
        //~-~-~-~-~-~-~-~-~-~-~-~-
        this.getServices = () => {
            return [this.lockService];
        };
        this.log = log;
        this.name = config["name"];
        this.doorbellInterface = doorbell_interface_1.InitDoorbellInterface();
        this.listenToDoor();
        this.lockService = this.createLockService(this.name);
    }
}
