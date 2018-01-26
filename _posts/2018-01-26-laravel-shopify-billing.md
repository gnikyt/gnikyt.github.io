---
layout: post
title: 'Laravel Shopify Billing'
date: '2018-01-26 15:52:56'
categories:
    - Programming
tags:
    - php
    - laravel
    - release
---

[![Billing Screen](/assets/images/posts/laravel-shopify-billing.png)](/assets/images/posts/laravel-shopify-billing.png)

Version 2.0.0 was [just released](https://github.com/ohmybrew/laravel-shopify/releases/tag/v2.0.0) which features the baked-in ability to turn your Shopify app into a billable app with some simple configuration additions.

It has support for the two methods Shopify supports, single and recurring charges. You have the ability to set the plan name, price, trial days, and more.

You also have to ability to easily upgrade or downgrade a shop's plan, enable them as a grandfather (skip billing), and more.

For full information see the release notes, [upgrading doc](https://github.com/ohmybrew/laravel-shopify/wiki/Upgrading#v1xx--v200), and the wiki page for [creating a billable app](https://github.com/ohmybrew/laravel-shopify/wiki/Creating-a-Billable-App).

Other minor updates include integration with StyleCI to keep coding standards within PSR1 and PSR2.
