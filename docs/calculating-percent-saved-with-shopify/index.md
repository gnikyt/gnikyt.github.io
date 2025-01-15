---
layout: post
title: Calculating percent saved with Shopify
permalink: calculating-percent-saved-with-shopify
date: '2015-09-24 16:09:00'
---

Visually displaying to the customer how much they are saving is a big help to driving them towards a purchase. This is a simple snippet and guide to help you achieve this functionality in your Shopify stores.

First, to calculate the percentage saved, let's look at the basic math for this in plain text.

    percent saved = ((old price - new price) / old price) * 100

If we were to replace the values with some real numbers we can see the result:

    ((231.99 - 200.00) / 231.99) * 100 = 13.789
    A savings of about 14% when rounded up

## The Snippet

Create a new snippet in Shopify called `percent-savings.liquid` and use the following code:

```liquid
{% raw %}
{% assign _compare_price  = compare_price | plus: 0.00 %}
{% assign _price          = price | plus: 0.00 %}
{% assign difference      = _compare_price | minus: _price %}
{% assign percent         = difference | divided_by: _compare_price | times: 100 | round %}
{{ percent }}%
{% endraw %}
```

As an explanation of the code:

- Lines 1 & 2 we are converting the prices to a float so we can use decimal places
- Line 3 is getting the difference which is simply subtracting the new price from the old price
- Line 4 is dividing the difference by the old price, then multiplying it by 100 and then rounding it

## Usage

Pass two parameters to the include tag.

1. `price` being the current price of the product
2. `compare_price` being the old price of the product.

```liquid
{% raw %}
{% if product.price_min < product.compare_at_price_min %}
  Old price {{ product.compare_at_price_min | money }} &ndash; {% include 'percent-savings', price: product.price, compare_price: product.compare_at_price_min %} savings!
{% endif %}
{% endraw %}
```

With the above example, if a product was $15.99 and is now $11.99 you should see it display:

    Old price $15.99 - 25% savings!

That's all - Happy coding!
