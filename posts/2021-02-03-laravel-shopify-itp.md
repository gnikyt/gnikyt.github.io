---
layout: post
title: Laravel Shopify ITP
permalink: laravel-shopify-itp
date: '2021-02-03 10:28:34'
---

## Background

[Laravel Shopify](https://github.com/gnikyt/laravel-shopify) is a package I started a few years ago which gained quite a bit of community traction. It is a full-featured package that helps you get up-and-running with developing Shopify apps with Laravel.

Around 2017, Safari, and later other browsers, began blocking browser storage access for third-parties. This includes cookies, session storage, local storage, and more. This was called "Intelligent Tracking Prevention" (ITP).

Given Shopify apps load within an iframe inside Shopify's admin panel, this means the app inside the iframe is a third-party, thus will be blocked from attempting to access storage.

Once ITP gained traction in the largest market share browser, Chrome, Laravel Shopify was immediately flooded with issues of users having trouble with their applications... no login session, authentication errors, etc.

## Solving

The problem was hard to debug and hard to resolve. It took many commits, lots of community input, and various testing methods to get a release out which assisted in the issue.

The solution was to create a flow that tried to handle everything smoothly for the app user.

1. A middleware to check if a cookie called `itp` exists
2. If not, redirect full-page to a route to set this `itp` cookie... this creates a first-party cookie since it was not created in an iframe
3. Re-check the existence of the `itp` cookie. In some cases, since the original cookie was created first-party, this re-check passes and the app will load
4. If the re-check fails... display a prompt to try and ask for storage access, and set a cookie through Javascript
5. If the prompt method fails... as a final fallback, we ask the app user to manually enable storage access

In *some* cases, `1->3` is enough to load the app, but in the *majority* of cases in testing, `1->4` is what's actually happening to initially get the app displaying properly.

The above flow is similar to what Shopify's own Ruby and Koa packages are following, which is what I tried to strive for in the latest release.

[![Step 4](/assets/images/2021/01/ls-ask.png)](/assets/images/2021/01/ls-ask.png)
*Step #4 - Asking for storage access*

[![Step 5](/assets/images/2021/01/ls-manual.png)](/assets/images/2021/01/ls-ask.png)
*Step #5 - Asking user to manually enable storage*

## Alternatives

Alternatively, you can skip the standard flow and utilize JWT which was introduced by a contributor a few released back. Currently, there is no wiki page for setting this up, but one is coming!

## Conclusion

ITP is still fairly new and still evolving with differences between browsers. The v16.0.0 release of the package will work well for mostly everyone, but more work may still need to be done in the future to correct some quirks.

For additional information, see the [ITP](https://github.com/gnikyt/laravel-shopify/wiki/ITP) wiki page on the repository. Also, thank you to the community for the assistance and patience during this large issue.
