---
layout: post
title: Counting unique options in Shopify
permalink: counting-unique-options-in-shopify
date: '2016-06-21 01:17:33'
---


Ever wanted to quickly display how many of an option a product contains?

    Available in 4 sizes
    ...
    Available in Red, Blue, Green
    ...
    Available in 10 colors

Here's an example of how to do just that (for color). Simply open your product's loop liquid and add this block at the top:

```liquid
# snippets/product_loop.liquid
{% raw %}
{% assign color_index = nil %}
{% assign color_label = 'Color' %}
{% if product.options[0] == color_label %}
  {% capture color_index %}option1{% endcapture %}
{% elsif product.options[1] == color_label %}
  {% capture color_index %}option2{% endcapture %}
{% elsif product.options[2] == color_label %}
  {% capture color_index %}option3{% endcapture %}
{% endif %}

{% assign colors = product.variants | map: color_index | uniq %}

This product is available in {{ colors.size }} {{ colors.size | pluralize: 'color', 'colors' }}
{% endraw %}
```

Now you should get a result (given you have a color option for your variants), showing you how many unique colors there are for the product. Here's what happened:

1. First, we determined which index the `Color` option was. Because Shopify only allows for three options, this makes it a quick check.
2. We grab the variants with `product.variants` and use [`map`](https://help.shopify.com/themes/liquid/filters/array-filters#map) to return the results for only `option1`, `option2`, or `option3` depending on the `color_index` value.
3. We then run the results through [`uniq`](https://help.shopify.com/themes/liquid/filters/array-filters#uniq) to filter out duplicates.

You can now apply the same logic to any options you want. Change the `color_label` variable to `Size` and you can get the same results but for sizes.

Allowing the customer to quickly scan what they're looking for and selecting the product appropriate to their needs... this little bit of Liquid can easily help with conversion rates.
