---
layout: post
title: 'Quickly Get All Products in Your Shopify Store with Ruby'
date: '2014-11-05 15:54:27.000000000 -03:30'
categories:
    - General
    - Programming
tags:
    - ruby
    - shopify
    - snippet
---
This is a simple snippet I've used over-and-over again this year to batch process products (modify tags, pricing, etc). It simply calculates the number of pages of products, pushes each page of products into a master array and returns them all. Should work well for others so I thought I would share.

<script src="https://gist.github.com/tyler-king/ebe47da8ff56e1c7c91e.js"></script>