---
layout: post
title: Developing sanely on Windows
permalink: developing-sanely-on-windows
date: '2016-11-07 11:22:00'
---

## Preamble

You might think, *"Why are you trying to develop on Windows? Why not use OSX or (insert Linux distro)"*. Its because I'm preparing for a stable future. With the decisions of Apple the past year with the iPhone and new Macbook, I no longer like the direction the company is taking. I won't go into depth, but the entire lineup is a laughing stock, to be honest. I will no longer be continuing with Apple for my next upgrades.

**I decided to run an experiment to see if I could survive on Windows for my development needs.**

## Why Windows

I used Linux on/off for close to 15 years now. Don't get me wrong, I **love** Linux, I always will. I don't care how many people say otherwise, its software support for many apps lacks compared to the Windows/Mac version. Many people will say, *"So switch to using (insert some different standard or app not many people use)"*, its not that easy especially in the business world. I can't just tell all my co-workers to start using random apps that have little backing. There's a suite of software I require daily which many do not work or lack proper implementation in Linux… and I'm not talking about the Adobe suite.

Apps in Windows normally get the first-class implementation — it just works. This is something important to me. I don't want to fix issues daily, I want to work. With OSX out of the picture, Windows was the next best thing for me that would *just work* and keep me *productive* in my mind.

### Configuration

*One warning about this post... I used Windows on my MacBook via Bootcamp. I feel its not the proper experience I could get out of Windows if I used a proper Windows laptop for work (XPS, Thinkpad, etc). I'll note more later why I say I did not get a proper experience.*

+ **Computer**:
  + *Model*: 2014 Macbook Pro Retina
  + *RAM*: 8GB
  + *Space:* 256GB SSD
+ **Windows**: 10 — Home Edition

## Setup Journey

### Virtual Machining

Development on Windows is a mess. If anyone's ever done Ruby, Python, etc, development on a Windows machine, it's usually a hit or miss. You run into issues with libs, compiling, support, mystic errors, and a pile of workarounds. A lot of people try to get around some issues by using tools like **[Cygwin](https://www.cygwin.com/)**, or some other shell implementation but they still run into issues. I wanted to avoid all these issues by essentially taking Windows out of the equation.

To do this, I decided to run Linux in a VM and host all my development needs in the VM. Now I have a clear separation. I can have the stability of Windows with all my required apps, and have my development… both in their worlds.

I decided to use **VMWare Player** and install **[Ubuntu Server 16.04 LTS](https://www.ubuntu.com/download/server)**. I chose Ubuntu over something like Arch simply for the time-sake of my experiment. From what I read, Ubuntu and VMWare have perfect support for one another. I require no desktop experience... simply a VM I can "talk" to, so something minimal like the Ubuntu Server was a good fit. I chose the fast install offered by VMWare Player and I had a working VM within 5 minutes.

#### Performance

Initially, I assumed this would eat a lot of my resources. I was wrong.

Post-boot, just idling, VMWare Player and the VM instance itself totaled to ~45mb of RAM in-use. The CPU was negligible as well. Even during an intensive process in the VM, the CPU only reached 21% and RAM didn't increase by much.

So my system was chugging along happily, the VM didn't seem to affect my computer's performance one bit from what I could tell.

### VM Communication & SSH

I did not want to use the windowed experience of VMWare. I decided I just need to SSH into the VM itself. I enabled **bridged networking** mode in VMWare. This gave the VM its own LAN IP address. For example, if my MacBook was 192.168.2.11 my VM could be assigned 192.168.2.13. I installed an SSH server on the VM and set it up to work for my needs. I now had a way to talk to the VM.

#### Choosing a SSH client

I regularly SSH into servers during my week to perform tasks, I also needed to (obviously) SSH into my VM. I looked over many options for Windows… **[Putty](http://www.chiark.greenend.org.uk/~sgtatham/putty/)**, **[Kitty](http://kitty.9bis.net/)** (fork of Putty), **[MobaXterm](http://mobaxterm.mobatek.net/)**.

I found Putty/Kitty to be great for customizations… its fully-loaded, although confusing interface, provides all anyone could need. It however lacked a single-window/tabbed mode or sub-connections as far as I could tell.

MobaXterm, although great, I found it to be a bit of bloat… I need a terminal and nothing else. It seemed geared towards a more full-featured implementation with support for X11 apps, FTP, text editing, etc.

In the end... I landed on **[SmarTTY](http://smartty.sysprogs.com/)**. An app I discovered while surfing Reddit for suggestions. It provided me with good configuration options, tabbed interface, sub-connections, lightweight, and more.

#### Testing Connections

I created an SSH key on the Windows side using Putty's keygen. I plugged the SSH key into the VM and fired up SmarTTY. I created a connection using my username, key file, and the VM's IP address.

It connected perfectly. I ran 4 sub-connections to the VM without issue. There was no lag in typing and input to the VM, I was pleased.

## Post Setup

So I now had a working, communicable, VM to host my development needs. I went ahead and set up all the tools I needed in the VM (RVM, Python, Go, MySQL, SQLite, Node, etc). On the Windows side I installed [Atom](http://atom.io), [MySQL Workbench](http://www.mysql.com/products/workbench/)/[SQL Workbench](http://www.sql-workbench.net/), [Slack](http://slack.com), and other tools. 

Workflow-wise — I'm happy. I'd edit my files in Atom, have my sessions opened in SmarTTY watching files (for Grunt or Rails, etc), edit my databases with workbench. Everything seemed to work fine without a hitch.

Although the setup took a bit time, I believe its a great path to take given Bash for Windows, is not fully ready yet for use. I actually, surprisingly found the Windows install to be snappier than OSX… I suspect that's due to it being a new install, however. The battery-life was on-par with OSX despite what I heard online of Windows draining MacBook batteries in no-time.

Overall I was happy with the Windows experience as a whole. Both as a developer and a PC user.

### Misc. Issues

Although the setup was fine, I was slightly hindered by not using a laptop designed for Windows in mind as I mentioned previously.

#### 1. Keyboard

A few text-flow issues I ran into that I normally do on Mac such as deleting a whole line of text was not possible because the MacBook keyboard is missing a few keys for this that Windows targets.

The position of the CTRL button was also slightly farther away than I liked. I found I had to change my natural posture for using CTRL functions due to the spacing for cutting, copying, pasting, etc.

#### 2. Mouse & Trackpad

Bootcamp installs drivers to emulate the trackpad a mouse. Tap emulates a click, two-finger emulates a right-click, and there are no trackpad gestures like dragging built-in. Changing the sensitivity of the scrolling with the trackpad would result in the mouse having the same scrolling sensitivity and one would be slower than the other. I found a great app to get around the issue, called **[EitherMouse](http://eithermouse.com)**. It detects individual devices and allows you to assign settings for each. This solved my issue on that part.

I suspect if I owned a Thinkpad, XPS, Zenbook, or some other Windows-designed laptop, I would have a much better experience.

### Verdict

I'll have my current MacBook and iPhone for a couple of years to come but my next upgrade in the future will move away from this company. This experience was a good lesson that yes, I can develop in Windows just fine, without any drawbacks that I can see to my flow. This will heavily weigh my decision for purchases in the future.

[![Trying Kitty with Ubuntu Server on a VM with Rails](/assets/images/0000/kitty_vm_rails.png)](/assets/images/kitty_vm_rails.png)
