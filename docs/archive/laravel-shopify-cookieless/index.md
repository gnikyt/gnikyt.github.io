---
layout: post
title: Laravel Shopify cookieless
permalink: laravel-shopify-cookieless
date: '2021-06-29 15:57:18'
archive: true
category: shopify,php,laravel
---

## This Issue

In the beginning part of 2021, Shopify introduced new requirements for apps to utilize the new session token implementations. Laravel Shopify package at the time, had just gone through a long process of implementing support for ITP to get around cookie issues. Now, with the announcement, that work needed to be scrapped.

On March 17th, [I opened an issue](https://github.com/gnikyt/laravel-shopify/issues/744) to outline the plan for tackling this new support for session tokens, and remove cookies/ITP. To be honest, I expected to tackle the work on my own. However, to my surprise, the community as well as Shopify themselves, helped lend a hand in getting this issue closed.

It was a large undertaking... to remove complete dependency on cookies, switch authentication and checks to use session tokens instead. Additionally, many internal improvements on top.

## Shopify

Shopify reached out to me a few weeks ago to discuss what they can do to help on the issue, as many developers utilize the package and were stuck for approvals due to the lack of session token support.

Shopify did not yet dabble in being involved with open source projects surrounding their platform, so this was a first for them; and I am proud the package was able to be a part of it!

After a couple quick meetings with their developer advocate team, we settled on [offering Shopify swag](https://github.com/gnikyt/laravel-shopify/issues/744#issuecomment-863326966) to gain momentum for anyone in support of closing the issue.

This was a great move for Shopify - getting involved with the community open source projects that touch their platform. In addition to the swag, [Lucas Michot](https://github.com/lucasmichot) of Shopify generated a number of pull requests to tighten up the CI, cleaniness, code coverage, and testability of the package.

## Community

For the community, we had a ton of support in every area! In total (hopefully not missing anyone), there were 23 community members helping to diagnose and solve this issue through comments or pull requests, I'd like to thank you all!

* @Enmaboya
* @alexweissman
* @arvesolland
* @LHongy
* @diemah77
* @darrynten
* @mkmaker
* @derickRenwick
* @ingalesachin7
* @mohinht
* @davodavodavo3
* @squatto
* @raibhuwan
* @thang12l
* @vicky92727
* @restyler
* @muhammadasfar
* @LonnyX
* @stevesweets
* @raff-shopify
* @andthink
* @jayShopTO
* @mattias

## What's next?

You can [view the release](https://github.com/gnikyt/laravel-shopify/releases/tag/v17.0.0) for `v17.0.0`. For the package, we will be watching for upcoming issues and attempting to place back per-user authentication support that was in previous versions.
