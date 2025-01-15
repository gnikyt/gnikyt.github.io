---
layout: post
title: Introducing Laravel Shopify
permalink: introducing-Shopify-for-laravel
date: '2017-08-09 16:35:00'
---

## Background

As an active Ruby (and Rails) developer, I found myself regularly making Shopify apps in Rails and Sinatra. I've even released my own Gems to solve common (small) issues I've faced developing for these platforms.

PHP itself... I haven't been active in years on that front. With PHP7 however, the language is shaping up. It doesn't have the great method chaining or syntax beauty that Ruby does, but its a well tested, proven, and mature language to work with that's easily deployable to a magnitude of places without much interaction.

Being out of the PHP game for a while, I decided to survey the landscape. I used to work heavily with Symfony, however, it always left a sour taste in my mouth. Symfony is great... its really well structured, enterprise type of framework. It falls short for medium-sized projects due to the verbosity of it (in my personal experience).

After some digging, I stumbled upon Laravel. Laravel, like many projects, uses bits of Symfony's core and builds on top of it. I spent a lot of time studying Laravel, its community, its activeness, its code. It looked solid and had great tools and documentation to go along with it. It has a lot baked into it, which is all easily configurable and accessible - it felt like Rails for PHP honestly.

[shopify_app](https://github.com/Shopify/shopify_app) is Shopify's own gem for building Shopify apps on Rails; quick and easy. It handles authentication, installation, webhooks, scripttags, ESDK integration, and more. In Laravel, I could not find a package that covered all those points.  I decided I'd go headfirst into Laravel and build a package for it.

## What The Package Does

Right from the Github page, the package handles all that `shopify_app` does:

- Provide assistance in developing Shopify apps with Laravel
- Integration with Shopify API
- Authentication & installation for shops
- Auto install app webhooks and scripttags through background jobs
- Provide basic ESDK views
- Handles and processes incoming webhooks
- Handles and verifies incoming app proxy requests

The package is fully tested and works with PHP >= 7 and Laravel 5.4.

## Project

You can head over to the [project's page](https://github.com/gnikyt/laravel-shopify) for full information, or also browse [the wiki](https://github.com/gnikyt/laravel-shopify/wiki) for documentation, installation, and other topics.

Happy coding with Shopify + Laravel!
