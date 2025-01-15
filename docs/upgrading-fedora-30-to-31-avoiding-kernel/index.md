---
layout: post
title: Upgrading Fedora 30 to 31 while avoiding kernel 5.4.7
permalink: upgrading-fedora-30-to-31-avoiding-kernel
date: '2020-01-15 19:13:27'
---

Fedora 30 was released on April 30th, 2019.

Fedora 31 was released on October 29th, 2019.

While Fedora 30 had minimal reported issues (at least socially), Fedora 31 was a different case altogether due to the 5.4.7 packaged kernel where Fedora 30 had 5.0 (later updated to 5.3.x).

There have been several reports of users' WIFI completely dropping, Ethernet not working, audio not working, and so on.

While I normally wait a few months after a major release for the dust to settle, there are a few features I was wanting, so I decided to upgrade and create a guide on how to keep your existing kernel during the upgrade.

## Upgrade

First, make sure all packages are updated.

`sudo dnf --refresh upgrade --exclude=kernel*`

This will refresh the repos, update your packages, and exclude any kernel updates.

## System Upgrade

Next, to upgrade to Fedora 31, run the following command.

`sudo dnf system-upgrade download --releasever=31 --exclude=kernel*`

This will download (not update) all packages needed to bump to release 31, while excluding any kernel updates.

You will be asked to accept various keys and accept the package summary. Once you're ready, continue the update.

Your system will reboot to a Plymouth screen with a progress bar showing the current status of the upgrade.

This upgrade takes approx. 15 minutes from my experience.

## Reboot

Upon reboot, you'll be booting into Fedora 31, the GRUB screen should show your 5.3.x kernel still there. If you've missed it, run `uname -r` in the terminal to confirm the version.

That's it. Please be sure to check out the [release notes](https://fedoraproject.org/wiki/Releases/31/ChangeSet) and keep an eye out for new kernel updates and reports to know when its safe to upgrade your kernel.
