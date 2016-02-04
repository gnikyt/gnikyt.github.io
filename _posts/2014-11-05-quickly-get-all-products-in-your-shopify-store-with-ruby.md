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
This is a simple snippet I've used over-and-over again this year to batch process products (modify tags, pricing, etc). It simply calculates the number of pages of products, pushes each page of products into a master array and returns them all. Should work well for others so I thought I would share. Theres a basic sleep call if the credits are low, there are more robust options to use but this one should hold over.

```ruby
require "shopify_api"

API_KEY    = "xxxxxxxx"
API_SECRET = "xxxxxxxx"
SHOP       = "xxxxxxxx"

ShopifyAPI::Base.site = "https://#{API_KEY}:#{API_SECRET}@#{SHOP}.myshopify.com/admin"

def get_all_products(products_per_page)
    product_count = ShopifyAPI::Product.count
    page_count    = (product_count.to_f / products_per_page.to_f).ceil

    products = []
    1.upto(page_count) do
        sleep 10 if ShopifyAPI.credits_left < 5
        
        _products = ShopifyAPI::Product.find(:all, params: { limit: products_per_page, page: i })
        products.push(*_products) if _products.length > 0
    end

    products
end

products = get_all_products 50

puts "You have #{products.length} products you can do stuff to"
```