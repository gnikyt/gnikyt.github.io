---
layout: post
title: WSL network speed
permalink: wsl-network-speed
date: '2021-11-16 12:52:01'
---

Recently, I jumped back into Windows after a few months of Linux and FreeBSD. I opted to upgrade to Windows 11 and clean out my system to be better for development.

I noticed that since the upgrade from Windows 10 to Windows 11... general "starting" of VSCode and connecting to WSL was slow. Additonally, internal network serving was slow such as Webpack dev server. Requests would take upwards of 5 minutes to serve a small-to-medium application.

In digging into it, [other people have reported similar issues](https://github.com/microsoft/WSL/issues/4901).

Here are my personal results with some methods listed in the issue thread.

Editing `resolv.conf` and `wsl.conf` to set a nameserver and disable WSL from autogenerating the `resolv.conf` file each time and overwriting our new settings.

```bash
sudo rm /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "[network]" > /etc/wsl.conf'
sudo bash -c 'echo "generateResolvConf = false" >> /etc/wsl.conf'
sudo chattr +i /etc/resolv.conf
```

For the above, this didn't change anything speed-wise for my situation using `speedtest-cli`.

The trick that worked for me was running PowerShell in adminsitrator mode and running `Disable-NetAdapterLso -Name "vEthernet (WSL)"`.

After a quick reboot, Webpack server was normal and `speedtest-cli` was reporting numbers identical to the host machine.
