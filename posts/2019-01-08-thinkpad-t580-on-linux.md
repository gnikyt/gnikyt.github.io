---
layout: post
title: Thinkpad T580 on Linux
permalink: thinkpad-t580-on-linux
date: '2019-01-08 19:44:11'
---

Lenovo is known for creating configurable machines that are great for both business and consumers, which are easily extendable or fixable by the average user thanks to their documentation and sane build.

They're also one of the very few vendors, if not the only, to claim Linux compatibility ("out of the box" working) for [many models](https://support.lenovo.com/ca/en/solutions/pd031426).

## My Machine

- Lenovo ThinkPad T580 (2018)
- 32GB RAM
- 500GB SSD
- 15.6" UHD matte screen
- Intel i7-8650U CPU @ 1.90GHZ x 8
- Intel UHD 620 (Kabylake) / Nvidia MX150
- Fingerprint reader
- Lenovo USB-C Dock

## Distro Choice

### History

I've been around the block when it comes to Linux, used it for over a decade, with 2003 being my first self-installation experience. It was a tough experience at that, head diving into non-GUI command line installations, partitioning, and many pages of installation manuals to read over.

I've tried everything from FreeBSD, Debian, Fedora, DSL, Redhat, OpenSUSE, Gentoo, Ubuntu, Slackware, Mandriva, Arch, and more. Hell, I even tried out Linux from Scratch for fun!

All that distro-hopping gained me a lot of experience, and by experience I mean the type of experience you gain when your system crashes for some random reason, becomes unusable, random annoyances you have/want to solve. Many of these distros I stuck with and used for years happily.

However, the last few years (if you can tell from my posts), I've been in the land of Mac and Windows... simply because at the time, I needed things to "just work" and being as mobile as I was, I couldn't afford my machine failing on me during a presentation or on-site job. I didn't even trust the ol' Debian route out of that fear.

### Change

Not to knock Mac or Windows, they're fine systems and you can get the job done on both through many of the tools available these days such as Vagrant, Docker, or even Microsoft's new WSL; but it just doesn't feel like home. You don't feel the control or the fullness open source software can bring you.

With my new T580, I decided to change that and get back on Linux - bite the bullet and make the system work but also trustworthy.

Thought a lot of research, trial, and error, I ended up choosing [Pop!\_OS](https://system76.com/pop). Its a distro based upon Ubuntu with many patches to assist in things like multi-DPI, Intel/Nvidia graphics switching, custom beautiful theming/icons, and sane defaults. Its the distro they pack into their own System76 machines.

## Installation

Installation was pretty simple, Pop's installer is well made, easy to follow, and clean.

Before beginning installation, I did the following:

- Wrote Pop to a USB stick
- Disabled Secure Boot in the BIOs
- Disabled Window's paging
- Disabled Window's restore point
- Shrunk Windows partition (through Windows Disk Management) to a bare minimum

Next:

- Created a EXT4 partition from the unallocated space
- Set Pop to use the new partition for the boot
- Set Pop to use the existing EFI partition

Pop then installed the system successfully and created a default boot entry.

Everything upon boot worked. Screens, WIFI, Bluetooth, etc.

## Tweaks

To make the most out of the ThinkPads, you should install the following.

#### TLP

TLP is a power-saving utility with special additions for Thinkpads. Such as battery thresholds, statistics, charging plans, recalibration, and more.

`sudo apt install tlp`

With this, you should also install the kernel modules for thresholds to work.

`sudo apt install tp-smapi-dms`

`sudo modprobe tp-smapi`

For more information visit the [TLP webpage](https://linrunner.de/en/tlp/docs/tlp-linux-advanced-power-management.html).

#### Audio

With the newer ThinkPads, Lenovo ships them with Dolby Digital assistant for Windows to make the built-in speakers sound beefy. On Pop (any others), the speaker will sound average... even lame.

To help with this, we can install PulseEffects. This is a complete tool for managing the audio output, allowing you to adjust and save/load presets to your liking.

`sudo apt install pulseeffects`

Once installed I recommend you check out [this repository on Github](https://github.com/JackHack96/PulseEffects-Presets) for some great ready-made presets. I recommend _Perfect EQ_.

Now, your speakers, and even other audio devices will sound great!

#### Wayland

If you have an Intel graphics card like me, then you're able to use Wayland.

`sudo nano /etc/gdm3/custom.conf`

Find `WaylandEnable=false` and commend it out: `#WaylandEndable=false`. Then, `sudo systemctl restart gdm.service`.

You should now be logged out and a visible cog icon should show next to "Login". Click it and select "Pop (Wayland)".

The only downfall is Firefox (and Chrome), as well as Thunderbird, do not support the scaling properly yet. I've heard the nightly edition of Firefox does solve these issues, however.

Given those scaling issues, I personally remain on the default Xorg for now. Which is totally fine! Pop has a great daemon running to detect when you plug in mixed DPI screens to the laptop. It will automatically adjust the resolutions to match so you won't have scaling issues.

#### Nvidia

As of writing, you can install the `nvidia-410` driver which works fine for the MX150.

Running `sudo powertop` and switching to the tunables tab, you should see a "BAD" status for the Nvidia power management. Simply click enter, to check it from bad to good. Using the recommended changes, my power usage for Nvidia (7-9W) closely matches Intel (6-8W of usage).

## A Month Later

It's now been a month and I've experienced no issues besides the rare issue of the desktop freezing sometimes when I plug in my USB-C dock, or monitors not waking up.

Overall, Pop is a great polished distro with a lot of care put into its end-to-end process from installation to the end-user experience with the polished custom themeing. Give it a try!
