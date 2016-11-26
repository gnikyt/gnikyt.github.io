---
layout: post
title: 'shopify_app_whitelist Gem'
date: '2016-11-26 16:45:01'
categories:
    - Programming
tags:
    - ruby
    - rails
    - shopify
---

I regularly use [shopify_app](https://github.com/Shopify/shopify_app). Its a great way to get an app, embedded or not, up and running with Rails.

Sometimes I'll create apps with `shopify_app` which are to be used by only one store. These apps sometimes have a front-end component for the themes... proxy integration, or JSON data fetching. I'd hate to have someone poke around and install the client's app to their own shop.

In the past I limited access to `shopify_app`'s session controller by having a `before_action` callback to confirm the shop. This gets repetitive quick and its not a central solution meaning its hard to update should the Gem change.

I decided to create a Gem for this problem which allows you to whitelist shops to have access to installing or accessing the app's backend. [shopify_app_whitelist](https://github.com/tyler-king/shopify_app_whitelist) adds a Railite which automatically injects a controller concern into your ApplicationController. It also adds a couple settings to `shopify_app`'s config so you can define your whitelist settings. I figured I would make as easy as possible.

You simply need to add the Gem to your Gemfile, add two configuration lines, and you're set. The Gem is fully tested and documented if you want to dig into the code. I hope someone will find it useful - enjoy!
