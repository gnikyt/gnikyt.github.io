---
layout: post
title: Apply, verify, and validate Shopify discount codes
permalink: apply-verify-and-validate-shopify-discount-codes
date: '2018-10-19 02:14:59'
---

Shopify doesn't have an API to verify discounts, however, I have found a little workaround.

By making an AJAX call to `/discount/(code)`, Shopify will set a cookie telling the checkout to auto-apply a discount on a visit to the checkout page.

Next, making an AJAX call to `/checkout`, we're able to parse the HTML and determine if the discount code worked!

Here's an example of it in action:

![promo-verify](/assets/images/posts/promo-verify.gif)

For the source code of this script, please see [this repository](https://github.com/gnikyt/Shopify-Frontend-Helper).
