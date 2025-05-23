---
layout: post
title: WordPress Local with WSL
permalink: wplocal-with-wsl
date: '2023-12-07 11:22:03'
archive: false
category: php,wordpress
---

A recent project was picked up from another agency where they utilized WP Engine and WP Local. WP Local *can* work with WSL, but the provided Debian package file seems to miss some dependencies required to properly use it and additionally, some issues cropped up which needed to be solved to have a fully working setup.

## Installation

Download WP Local and save it to your Downloads directory. Next, open your Windows Terminal and run the following command:

`sudo dpkg -i /mnt/c/Users/[your user]/Downloads/local-[version]-linux.deb`

Replacing `[your user]` with your Windows username and `[version]` with the downloaded WP Local version, example:

`sudo dpkg -i /mnt/c/Users/tyler/Downloads/local-8.1.0-linux.deb`

This will install WP Local and automatically create a Start Menu entry for `Local (Ubuntu)` (in my case), but you can also spawn it through the terminal with `/usr/bin/local`.

[![WP Local Running inside WSL](/assets/images/posts/wplocal_running.png)](/assets/images/posts/wplocal_running.png)

Although its open and running, if you immediately tried to connect to WP Engine and pull down a project, you'll have displays with errors pop up such as the inability for WP Local to ask for priviliages (sudo) and issues for it to properly configure NGINX.

With a lot of digging around the web to solve both issues... I came across a great post by [robert77](https://community.localwp.com/u/robert77) on the WP Local Community Forums which I will outline below.

## Fixing Dependencies

As mentioned earlier, not all dependencies we actually end up being installed. I am unsure if the Debian package defines the dependencies to be installed, or they error upon installing (I did not see an error in my case), but... we need more packages regardless!

Run `sudo apt-get update && sudo apt-get upgrade` to ensure package information is updated and accurate.

Next, run:

```bash
sudo apt-get -y install libaio1 libncurses5 libnss3-tools rsync shared-mime-info desktop-file-utils libxshmfence1 libglu1 libatk1.0-0 libatk-bridge2.0-0 libgtk2.0-0 libgtk-3-0 libgbm-dev libasound2 libnuma-dev libxslt1.1 lxqt-sudo libzip4
```

This will ensure were able to display a GUI for the privilaged requests, rync is installed for Local to use, and other items.

Next we need to download a couple packages manually:

```bash
curl -O http://snapshot.debian.org/archive/debian/20190501T215844Z/pool/main/g/glibc/multiarch-support_2.28-10_amd64.deb
sudo dpkg -i multiarch-support_2.28-10_amd64.deb
```

```bash
curl -O http://snapshot.debian.org/archive/debian/20141009T042436Z/pool/main/libj/libjpeg8/libjpeg8_8d1-2_amd64.deb
sudo dpkg -i libjpeg8_8d1-2_amd64.deb
sudo cp /usr/lib/x86_64-linux-gnu/libonig.so.5 /usr/lib/x86_64-linux-gnu/libonig.so.4
```

This takes care of the needed dependencies.

## Priviliaged Requests

To enable the ability to ask for privilaged access, we need a way for Local to spawn a GUI to ask for a password.

Running `sudo nano /usr/bin/kdesudo` should open a new file. Inside the file, paste the following to use LxQT's prompt:

```bash
#!/bin/bash
/usr/bin/lxqt-sudo $7
```

Then run `sudo chmod +x /usr/bin/kdesudo` to allow it to be executable.

An example of it running:

[![LxQT Sudo GUI](/assets/images/posts/wplocal_sudo.png)](/assets/images/posts/wplocal_sudo.png)

## NGINX Fix

If you are pulling down a project from WP Engine which uses NGINX, it will attempt to set capabilities but be unable to. To fix this, run the following:

```bash
sudo setcap 'cap_net_bind_service=+ep' /opt/Local/resources/extraResources/lightning-services/nginx-[version]/bin/linux/sbin/nginx`
```

Replacing `[version]` with the current NGINX version listed in the directory, in my case it was `1.16.0+7`.

## Recommended

Once completed, recommendation would be to change WP Local to use "localhost" instead of "Site Domains", but should you choose to use "Site Domains", you will need to add an entry to your Windows' hosts file (`C:\Windows\system32\drivers\etc\hosts`) for the domain. For example, if your project was `jumping-bean.local` you would need to add `127.0.0.1  jumping-bean.local` to the hosts file.

I chose localhost because it was easier to communicate with a custom frontend that was built for this specific project, but it comes down to preference. I also can not speak to how well trusting a self-signed certificate works from within WSL to Windows with a browser, I have not tried it.

## Bonus: Git Integration

If you're curious on how you can pull down a project with WP Local and connect it to either a new or existing repository, then it can be achieved by doing the following steps, at a high level:

1. Pull down the project with WP Local
2. Open your terminal, change directory into the project
3. Change directory into `app/public`
4. Init a repository
5. *(if applicable)* Connect to existing repository
6. *(if applicable)* Pull down repository changes

Script:

```bash
cs app/public && \
git init && \
git remote add origin [url] && \
git fetch origin master && \
git reset --hard origin/master
```

Replacing `[url]` with your repository's URL.

Once completed, this will allow you to make changes to your code and have it synced with WP Local, and additionally deploy the code with WP Local if that is the deployment setup you have in place.

## Conclusion

That's it! A very helpful post from robert77 leads to a working WP Local installation. When previewing the site, WSL even opens your default browser (on Windows) just fine.
