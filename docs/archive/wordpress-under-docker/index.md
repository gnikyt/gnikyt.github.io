---
layout: post
title: WordPress with Docker
permalink: WordPress-under-docker
date: '2017-06-15 09:53:10'
category: php,wordpress
---

## Purpose

There are many lengthy guides out there for the official Docker image for WordPress. However, some people have a little trouble getting going so I will quickly provide some tips to help out.

I haven't used WordPress professionally in a long time, but I decided to do some weekend digging to keep my brain fresh, so forgive any errors ;)

## Setup

### Directories

Let's create a basic directory structure to use. Keep in mind, this is geared for theme development.

- {your_theme}/
  - wordpress/
    - wp-content/
      - themes/
        - (your-theme)/
      - uploads/

We only need to track our theme, so we do not need to install the whole WordPress system.

Once done, be sure to `chmod 755 wordpress/wp-content/uploads/` so WordPress can write to this directory when uploading media.

### Docker

Next, let's get Docker ready. The simplest way is to use a [Docker Compose file](https://docs.docker.com/compose/). It's a simple YML-formatted file that's easy to read for anyone.

Based on [WordPress' Offical Image](https://hub.docker.com/_/wordpress/), I've compiled the following `docker-compose.yml` [file you can use](https://github.com/gnikyt/wordpress-docker-quickstart).

Simply replace `{YOUR_THEME}` with your theme name and save it to the root of `{your_theme}/` directory.

### Volumes

In the `docker-compose.yml` file you'll notice two entries under `volumes`.

One maps the theme folder to the WordPress install so it's visible to WordPress, the other maps, read-write, `wp-content/uploads` to the WordPress install as well so it can write and read media from a location accessible.

### Git Ignore

Now that you have the directories set up, Docker Compose ready, volumes mapped... its time to setup Git.

`wordpress/wp-content/uploads/*`

Now, we keep track of only our theme.

## Running

Once you're done the quick setup simply run `docker-compose up` in the main directory. On the first run, you'll have to run through the WordPress installation process.

After it's done, simply log in and visit Appearance. If you have your theme setup as per WordPress requirements (`style.css` (with info) and `index.php`)  then you will see it in the theme list. Hit "Activate" and you're ready to go.

## Windows (WSL1) Tips

If you're running this under WSL1, be sure you have Docker on Windows settings set to expose Docker daemon without TLS (it's under General panel).

Also, WSL1 accesses your C:\ drive via `/mnt/c` but Docker requires `/c`. To resolve this issue simply create a symlink via `ln -s /mnt/c /c`. If this is not done, you'll have issues with Docker under WSL trying to find files and map volumes. This means you also need to run `docker-compose` commands under `/c` as well.

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

[I've set up a repo on Github](https://github.com/gnikyt/wordpress-docker-quickstart) which contains all I've talked about above plus some extras like a basic Grunt setup for managing asset files. Feel free to clone, run `docker-compose up`, and play around!

I hope this has helped anyone struggling.
