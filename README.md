## About 
This project contains two related elements. Really, these two elements should be pulled into separate repos, but this is just a weekend hobby project... so, you know, convenience and what-not.

1. `door-server.py` this is the server that runs locally on the raspberry pi in order to monitor the status of the connected automation hat and the doorbell itself. This should be installed and run on the raspberyy pi itself.
2. (everything else) is the homebridge plugin to enable communication between the doorbell accessory and the homebridge

Note that because this has local dependencies and isn't intended to be published as a true homebridge-plugin, it must be installed at a particular directory: `~/doorbell/`

## Administration on the Raspberry Pi

**To SSH:**

1. Make sure the Raspberry Pi is running
2. Run `ssh pi@raspberrypi.local` in a terminal window
3. Enter the password for the Raspberry Pi

Homebridge config on the Raspberry Pi is configured here
```
~/.homebridge/config.json
```

To shutdown run: `sudo shutdown -h now`

## Some helpful articles:

- Creating a homekit plugin)[https://blog.theodo.com/2017/08/make-siri-perfect-home-companion-devices-not-supported-apple-homekit/]

## Debugging

Hardcoded filepaths exist in `/src/doorbell-interface.ts`. These are obviously fragile.