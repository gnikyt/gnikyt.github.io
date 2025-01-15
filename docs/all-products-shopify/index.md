---
layout: post
title: all_products... finally
permalink: all-products-shopify
date: '2015-06-24 14:23:00'
---

[Shopify has finally implemented a global variable for accessing products](https://github.com/Shopify/liquid/issues/438#issuecomment-108981467).

Shopify has [global variables](https://docs.shopify.com/themes/liquid-documentation/objects) for many things like Collections, Linklists, pages, etc, so you can do things such as access a collection by its handle `collections.my-cool-toys.products`. However, it always lacked the ability to look up products by their handle until now.

There's no documentation yet for the new variable but as the Github comment states, simply use `all_products['handle-here']`

```html
<img src="{% raw %}{{ all_products['mario-party-game'].featured_image.src | img_url: 'medium' }}{% endraw %}">
```
