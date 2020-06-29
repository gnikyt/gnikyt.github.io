---
layout: post
title: Apply, Verify, and Validate Shopify Discount Codes
permalink: apply-verify-and-validate-shopify-discount-codes
date: '2018-10-19 02:14:59'
---

Shopify doesn't have an API to verify discount, however I have found a little work-around.

By making an AJAX call to `/discount/(code)`, Shopify will set a cookie telling the checkout to auto-apply a discount on visit to the checkout page.

Next, making an AJAX call to `/checkout`, we're able to parse the HTML and determine if the discount code worked!

Here's an example of it in action:

![promo-verify](/assets/images/2018/10/promo-verify.gif)

For source code of this script, please see [this repository](https://github.com/osiset/Shopify-Frontend-Helper).