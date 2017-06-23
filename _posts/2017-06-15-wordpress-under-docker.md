---
layout: post
title: 'Wordpress Under Docker - A Basic Guide'
date: '2017-06-15 09:53:10'
categories:
    - Programming
tags:
    - windows
    - wordpress
    - tips
    - development
    - docker
---

## Purpose

There's many lengthy guides out there for the official Docker image for Wordpress. However, some people have a little trouble getting going so I will quickly provide some tips to help out.

I haven't used Wordpress professionally in a long time, but I decided to do some weekend digging to keep my brain fresh, so forgive any errors ;)

## Setup

### Directories

Lets create a basic directory structure to use. Keep in mind, this is geared for theme development.

- {your_theme}/
  - wordpress/
    - wp-content/
      - themes/
        - (your-theme)/
      - uploads/

We only need to track  our theme, so we do not need to install the whole Wordpress system.

Once done, be sure to `chmod 755 wordpress/wp-content/uploads/` so Wordpress can write to this directory when uploading media.

### Docker

Next, lets get Docker ready. The simplest way is to use a [Docker Compose file](https://docs.docker.com/compose/). Its a simple YML-formatted file that's easy to read for anyone.

Based on [Wordpress' Offical Image](https://hub.docker.com/_/wordpress/), I've compiled the following `docker-compose.yml` [file you can use](https://github.com/ohmybrew/wordpress-docker-quickstart).

Simply replace `{YOUR_THEME}` with your theme name and save it to the root of `{your_theme}/` directory.

### Volumes

In the `docker-compose.yml` file you'll notice two entries under `volumes`.

One maps the theme folder to the Wordpress install so its visible to Wordpress, the other maps, read-write, `wp-content/uploads` to the Wordpress install as well so it can write and read media from a location accessible.

### Git Ignore

Now that you have the directories setup, Docker Compose ready, volumes mapped... its time to setup Git.

```
wordpress/wp-content/uploads/*
```

Now, we keep track of only our theme.

## Running

Once you're done the quick setup simply run `docker-compose up` in the main directory. On first run, you'll have to run through the Wordpress installation process.

After it's done, simply login and visit Appearance. If you have your theme setup as per Wordpress requirements (`style.css` (with info) and `index.php`)  then you will see it in the theme list. Hit "Activate" and you're ready to go.

## Windows (WSL) Tips

If you're running this under WSL, be sure you have Docker on Windows settings set to expose Docker daemon without TLS (its under General panel).

Also, WSL accesses your C:\ drive via `/mnt/c` but Docker requires `/c`. To resolve this issue simply create a symlink via `ln -s /mnt/c /c`. If this is not done, you'll have issues with Docker under WSL trying to find files and map volumes. This means you also need to run `docker-compose` commands under `/c` as well.

To quickly switch to `/c` no matter what directory you're under, open `$HOME/.bash_aliases` and add this entry:

```shell
alias cswap='cd `pwd | sed 's,/mnt,,g'`'	
```

Now, any directory you're in, simply run `cswap` and it'll move you to `/c`

```shell
tyler@bash[/mnt/c/Users/Tyler/Development/GitHub/wordpress-docker-setup/]$ cswap
tyler@bash[/c/Users/Tyler/Development/GitHub/wordpress-docker-setup/]$ docker-compose up
Starting...
```

## Further Exploring

[I've setup a repo on Github](https://github.com/ohmybrew/wordpress-docker-quickstart) which contains all I've talked about above plus some extras like a basic Grunt setup for managing asset files. Feel free to clone, run `docker-compose up` and play around!

I hope this has helped anyone struggling.