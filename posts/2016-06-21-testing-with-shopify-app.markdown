---
layout: post
title: Testing with shopify_app
permalink: testing-with-shopify-app
date: '2016-06-21 01:17:33'
---

[shopify_app](https://github.com/Shopify/shopify_app) is a great Gem to quickly build a Shopify App with Rails. It handles all the verifications, authorizations, webhook, and more; leaving you to focus on developing your app. This post is to serve as a quick tip on how to unit-test your app with the Gem.

Other than the install page, most likely your app will require a shop to be logged in for all routes. `shopify_app`, upon installation will create a fixture file in `test/fixtures/shops.yml` of your Rails application.

Inspecting it you will see it's filled with one shop, `regular-shop.myshopify.com`, and a simple token. When running `bundle exec rake test` (after migrations are done for a test environment of course), it will populate the shop database table with the fixture data in `shop.yml`.

Now that we have a shop we can "log into", let's create a support module for the unit tests. Create a file called `shopify_session_support.rb` inside `test/support`.

```ruby
# test/support/shopify_session_support.rb
module ShopifySessionSupport
  # Make this module concernable
  extend ActiveSupport::Concern

  included do
    # On include, tell TestCase to use this setup block
    setup do
      # Set the shop to the test shop from fixtures
      # The key is `:shopify` and `:shopify_domain` which shopify_app needs
      # See: https://github.com/Shopify/shopify_app/blob/c7e50247a72a52b1d1e4d9009ba997196a64e7e8/lib/shopify_app/login_protection.rb#L22
      session[:shopify]        = shops(:regular_shop).id
      session[:shopify_domain] = shops(:regular_shop).shopify_domain
    end
  end
end
```

Next, include your new support module in `test_helper.rb` before `class ActiveSupport::TestCase` with:

```ruby
# Include support modules
Dir[Rails.root.join('test/support/**/*.rb')].each { |f| require f }
```

Finally, in any of your controller tests where you require an authenticated shop, simply add `include ShopifySessionSupport` to your class as such:

```ruby
# ...
class ImageControllerTest < ActionController::TestCase
  include ShopifySessionSupport
  # ...
end
```

Running `bundle exec rake test` should now pass your tests with the shop.
