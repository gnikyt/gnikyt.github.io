---
layout: post
title: 2018 Self reflection
permalink: 2018-self-reflection
date: '2019-02-06 19:09:24'
---

It is a couple of months into 2019 already! I sat down and thought about all I've done in 2018 in regards to my digital landscape. On initial spark of this, I didn't think of much therefore, I didn't do much; but, I was wrong!

## Software

### Open Source

Last year I hunkered down and focused on my open source projects.

A few silly ones like [movie-barcode](https://github.com/gnikyt/movie-barcode), [CloudApp-Bash](https://github.com/gnikyt/cloudapp-bash), or [With](https://github.com/gnikyt/with) and some more important ones, which have gained some popularity, such as [Laravel Shopify](https://github.com/gnikyt/laravel-shopify) and [Basic Shopify](https://github.com/gnikyt/Basic-Shopify-API) API.

Focusing on my open source work has not only allowed me to refine my existing public code (which some of it has aged), keep self-improving, but also help others who've faced similar issues.

In regards to _Laravel Shopify_ in particular, I hinged on learning the core of Laravel, and coming from a previous Symfony background, this was not hard - just _different_. Laravel feels more like _Rails_ for PHP - a framework to get things done quickly. _Laravel_ was missing a decent Shopify boilerplate package at the time so I created the package from the ground-up to follow similar practices to how _Rails'_ version, _shopify\_app gem_ does.

It has since gained a lot of popularity with many helpful contributors both in pull requests and general questions people post in the issue section. This, in-conjunction with _Basic Shopify API_ package, has allowed many companies (based on their personal thank you emails to me) to create Laravel-powered Shopify apps fairly quickly, letting them focus on their apps code and not the setup.

Open-source ecosystems are always great to be involved with. I'm glad I've had the late nights this year to give back to it.

## Operating

Its been a hectic year bouncing between operating systems. As a long time Linux user, I broke the streak in 2014 when I purchased my Macbook. However, last year my Macbook finally hit the grave and I purchased a Thinkpad T580 to replace it (with some great specs too!), leading me to use Windows for a few months, but now I'm back on Linux!

Thankfully for software like Vagrant, Docker, WSL, VSCode, and more, my productivity hasn't been impacted between these transitions since most everything I write these days is either fairly portable or easily setup on another system.

I've opted for [PopOS](https://system76.com/pop) on my T580 given its great support for dual graphics cards and customizations. I even have a [recent post](/thinkpad-t580-on-linux/) outlining some steps I took to optimize the T580 for daily-driver usage.

## Code

Besides moving away from _Ruby/Rails_ due to less demand, and focusing back to _PHP/Laravel/Symfony_ and _Python_, I've also taken a great focus on modern _Javascript/Node_ and _Typescript._

I've fallen in love with _Typescript_ (compared to plain Javascript). Not only is it backed by _Microsoft_, but its integration with _VSCode_ has been great. It allows you to write code you can trust by ensuring values in, out and across, are correct and properly formed... something greatly missing from plain Javascript.

From a pure web-perspective... a good _Typescript_ setup with _Babel/Browserify and some polyfills,_ can allow you to write modern Javascript that transpiles down to something that's able to work even on older browsers. Keeping a nice, clean, modern source code.

I currently have a large _Typescript_ library assisting an enterprise company processing over 15 million hits a month successfully.

Besides the backend, I have also hit the mobile space with Flutter/Dart and ReactNative. I had a chance to work on some interesting projects involving Bluetooth low energy (BLE) between custom devices and mobile phones, as well as some cool unique NFC implementations.
