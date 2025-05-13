---
layout: post
title: i3-Plasma for a solid match
permalink: i3-plasma-a-solid-match
date: '2019-08-28 04:06:39'
archive: true
category: cmd
---

[![Cover Image](/assets/images/posts/screenshot.png)](/assets/images/posts/screenshot.png)

## Introduction

I have been struggling recently to find a good match of the following:

1. Productivity
2. Simplistic
3. Beauty
4. No hassle

Plasma on its own, much like any other desktop environment such as XFCE or GNOME, does a great job of throwing you into a full-featured and worry-free setup. Everything from suspending, audio, Bluetooth, and more is handled pretty much out-of-the-box these days.

However, all the major desktop environments are geared towards floating and manually managing windows like you would with Windows or OSX. You end up spending a good chunk of time attached to your mouse... moving, resizing, and managing those windows to do your work. Yes, you could tweak the settings of these desktop environments to semi-simulate what a good window manager can do, but it is not the _same_.

With a configurable window manager, such as i3, sway, bspwm, and others, you're able to solely use your keyboard to manage windows in a way that's efficient, natural, and powerful.

For someone like me, who doesn't use a mouse (I use my Thinkpad dot only) and has back/neck issues... the less I move around (reaching for mice), the better!

So, to hit all points above... a combo of Plasma and i3 works wonders. And the best thing is that it takes no time at all to setup.

## Setup

I followed [this guide](https://ryanlue.com/posts/2019-06-13-kde-i3) originally with some tweaks. Since I use OpenSUSE, I did the following for my system (slightly different paths):

```bash
# Install i3
sudo zypper in i3

# Create a Plasma + i3 launcher script
$ echo -e '#!/bin/sh\n\nKDEWM=/usr/bin/i3 startkde' > /usr/local/bin/startkde-i3
$ sudo chown root.root /usr/local/bin/startkde-i3
$ sudo chmod 755 /usr/local/bin/startkde-i3

# Create a custom desktop sessions directory
$ sudo cp -a /usr/share/xsessions /usr/local/share/xsessions

# Create a new desktop session file for plasma + i3
$ cp /usr/local/share/xsessions/default.desktop /usr/local/share/xsessions/plasma-i3.desktop
$ sudo sed -i 's|/usr/bin/startkde|/usr/local/bin/startkde-i3|' /usr/local/share/xsessions/plasma-i3.desktop
$ sudo sed -i '/Name.*=/ s/$/-i3/' /usr/local/share/xsessions/plasma-i3.desktop

# Configure sddm (the login screen) to use our new desktop sessions directory
$ echo -e '\n\n[X11]\nSessionDir=/usr/local/share/xsessions' | sudo tee -a /usr/lib/sddm/sddm.conf.d/00-general.conf
```

Logging out, you'll be presented with an option in SDDM for `Plasma-i3`.

## Tweaking

Several tweaks are needed to ensure an environment that works well for Plasma and i3.

This involves killing off Plasma desktop, telling i3 how to handle certain windows/popups/dialogs, and configuring launchers.

[.Xresources](https://github.com/gnikyt/dots/blob/master/.Xresources) is a great way to configure cross-compatible settings for cursors, fonts, colors, and more. Mine simply has just that - colors, cursors, fonts, and some settings for URxvt (terminal).

You can utilize your Xresources to pull in config values into i3.

[Here is my i3 config](https://github.com/gnikyt/dots/blob/master/.config/i3/config), which has pre-defined settings for handling the different Plasma windows. I have several standard keybindings defined, launchers, and window management. You can go in-depth as you like... you can target certain windows/popups/window-titles and more to do anything you like. You can have certain windows float, certain windows open on a monitor or workspace, certain windows have priorities, certain windows that open next to other certain windows, and so forth; you can go nuts!

### Bars

You're able to use any "bar" or panel you like with this setup.. weather it be i3bar, polybar, or plain Plasma panel as I have.

If you decide to use Plasma panels, definitely install [Virtual Desktop Bar Widget](https://store.kde.org/p/1315319/), its a virtual desktop pager which is configurable and simple, and mimics how most other "bars" handle workspaces (its the widget in the screenshot above with "web", "code", "mail", etc).

## Conclusion

Give a try. My dot files for i3 and .Xresources has a good starting ground which you can expand upon and enjoy a mouseless experience!
