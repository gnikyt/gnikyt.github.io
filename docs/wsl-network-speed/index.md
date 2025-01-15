---
layout: post
title: WSL network speed
permalink: wsl-network-speed
date: '2021-11-16 12:52:01'
---

Recently, I jumped back into Windows after a few months of Linux and FreeBSD. I opted to upgrade to Windows 11 and clean out my system to be better for development.

I noticed that since the upgrade from Windows 10 to Windows 11... general "starting" of VSCode and remote connecting to WSL was slow. Additonally, internal network request serving was slow; things such as Webpack dev server would take upwards of 5 minutes to serve a small-to-medium application.

In digging into it, [other people have reported similar issues](https://github.com/microsoft/WSL/issues/4901). Using `speedtest-cli`, my download was decent but my upload speed was in the 0.5-0.8 mbps range.

I decided to try some solutions listed in the issue and here are my personal results...

## Potential Solution #1

Editing `resolv.conf` and `wsl.conf` to set a nameserver and disable WSL from autogenerating the `resolv.conf` file each time and overwriting our new settings.

```bash
sudo rm /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "[network]" > /etc/wsl.conf'
sudo bash -c 'echo "generateResolvConf = false" >> /etc/wsl.conf'
sudo chattr +i /etc/resolv.conf
```

For the above, this didn't change anything for me when re-running `speedtest-cli`, I was still seeing very slow upload speeds.

## Potential Solution #2

Opening PowerShell in adminsitrator mode and running `Disable-NetAdapterLso -Name "vEthernet (WSL)"`.

This solution seemed to actually work in my case! Webpack dev server was operating normally and `speedtest-cli` was reporting numbers identical to the host machine in both download and upload.
