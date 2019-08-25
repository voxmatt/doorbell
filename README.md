## About 
A Homebridge plugin for a Raspberry Pi with an Automation Hat that is controlling an old, buzzer-activated door gate. Directly inspired by [this article](https://medium.com/dirigible/siri-controlled-1970s-intercom-door-ecd7a6b0df31) Please note that this plugin represents only the software component. The hardware is a different manner entirely, but is explained in the above mentioned article. Maybe I'll get around to detailing it someday...

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

To run the plugin locally on the raspberry pi (instead of from npm):
`DEBUG=* /usr/bin/homebridge -D -P doorbell/`

**To enable the reboot daemon**

```
systemctl daemon-reload
systemctl enable homebridge
systemctl start homebridge
```

**To check the status**

```
systemctl status homebridge
```

## Some helpful articles:

- [Siri Controlled 1970s Intercom Door](https://medium.com/dirigible/siri-controlled-1970s-intercom-door-ecd7a6b0df31)
- [Creating a homekit plugin](https://blog.theodo.com/2017/08/make-siri-perfect-home-companion-devices-not-supported-apple-homekit/)
- [Instructions to boot homebridge on startup of the raspberry pi](https://gist.github.com/johannrichard/0ad0de1feb6adb9eb61a/)