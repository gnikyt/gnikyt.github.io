---
layout: post
title: Shopify Liquid Tester
permalink: shopify-liquid-tester
date: '2022-11-20 14:08:03'
---

## Introduction

Shopify's theme system currently lacks the ability to define custom "functions". As a result, many Shopify developers use Liquid snippets to accept inputs and echo an output result, to create a pseudo-function within Shopify.

A very basic example:

```liquid
{%- raw -%}
# snippets/fn-remove-prefix.liquid
{%- comment -%}
  Removes tag prefix.

  Parameters:
    tag, string, required: Tag string to remove prefix on.
  
  Syntax:
    {%- render 'fn-remove-prefix', tag: [string] -%}
  
  Example:
    {%- render 'fn-remove-prefix', tag: 'Type:Cannabis' -%}
  
  Output:
    Cannabis
{%- endcomment -%}
{%- liquid
  echo tag | split: ':' | last
-%}
{% endraw %}
```

For such a small "function", no one would second guess, however, working with merchant data is sometimes a challenge... What if there is multiple `:` in the tag string? What if we need the resulting value converted to something else, consistently?

We can not unit test Liquid files in the context of a Shopify store very easily, which is why I developed a handly tool called [liquid-fn-tester](https://github.com/gnikyt/liquid-fn-tester) to assist with this for our clients.

## How it works

The tool works by injecting a custom page into your Shopify store and also injecting your snippet to test into the Shopify theme.

Then, for each test assertion, it then will inject a custom page template with your Liquid and reference your snippet.

From here, the page content is fetched with no layout to get the result, for which the result is then used to test for expected output.

#### Questions

**_Why a new page for each test assertion?_**

Shopify caches page content since last year. By creating a new page for every test assertion, we can get around the issue of having stale/wrong output. Upon completion of the test suite, all created page templates on the theme are removed as part of cleanup.

**_How flexible is this?_**

You extend the base test class which does all the heavy lifting. You have freedom to define setup, teardown, and tap into various events documented in the repository's README to further customize your tests.

**_Why NodeJS?_**

Previously, I had attempted a similar setup with Ruby, since Shopify's Liquid library is a Ruby package (Gem).

While the implementation worked great, it had flaws of not being able to utilize Shopify data or Shopify's custom Liquid filters such as `asset_url`, `img_tag`, `money`, etc. which could lead to some snippets not producing a true result to what it would on Shopify's servers.

Given the process to get a result of the snippet rendering, the tool really could've been developed in any language such as Go, or Python, etc. however, given majority of Shopify developers most likely know their way around Javascript, then it made sense to go down that path.

## Utilization

Similarly stated in the README of the repository, if you place your Liquid function snippet into the `tests` directory, with a defined test suite to match, you will be able to unit test the result of the snippet. Because its executed on the Shopify store, the snippet you wish to test will have access to everything for Shopify's Liquid and the store itself; such as `request`, `all_products`, `| asset_url`, etc.

Your test suite will have full control over setup, snippet initilization, teardown, output, and more.

The repository's [provided examples](https://github.com/gnikyt/liquid-fn-tester/tree/master/tests) is a great guide for how everything comes together and how you can test a single snippet against multiple values.

![Liquid Fn Example](/assets/images/posts/liquid-fn.png)

____

Hopefully this tool will continue to grow and is helpful to those who are looking to try and test their snippets; both small and complex.
