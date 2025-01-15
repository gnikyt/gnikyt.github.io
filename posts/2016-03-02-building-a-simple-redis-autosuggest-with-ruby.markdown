---
layout: post
title: Building a simple Redis autosuggest with Ruby
permalink: building-a-simple-redis-autosuggest-with-ruby
date: '2016-03-02 01:02:11'
---

So you have a search box on your website.. an article search, a product search.. whatever it may be, you may find yourself the need to display suggested results to your user based on what they type. Redis is the perfect solution.

## Planning

Let's say we have a bunch of products:

+ Tommy's Ray Gun - ID: 1
+ 1990 Blaster Ray!! - ID: 2
+ (Nuke) Bomb Gun #8 - ID: 3

Looking at our products, we can see there is a different and unpredictable title. We have punctuation, special characters, numbers, and letters. If someone types `Gun` we'd like to see our search suggest `(Nuke) Bomb Gun #8` and `Tommy's Ray Gun`.

Redis does not offer a full-text search solution like ElasticSearch, so we simply can't drop `Tommy's Ray Gun` string into Redis and expect to search it. We need to come up with a clever way.

My solution was to split each letter up of each word in each product. For each letter set, we store the products which contain those letters. So common sets of letters in titles will be stored together.

As a basic example, let's look at a singular word. `RUBY` we can split this up into `R` then `RU` then `RUB` and finally `RUBY`.

Lets store these product titles in this manner with the values being the title and ID for the product into a [Redis sorted set](http://redis.io/commands/ZADD). Now, when someone types `gun` in your search box we should be able to call `p:gun` key on Redis and get:

+ `Tommy's Ray Gun//1`
+ `(Nuke) Bomb Gun #8//3`

## Processing the Objects

So now we have a plan in place, let's write a quick script to import the objects you wish to autosuggest, into your Redis database. As before, we need to split each word up of each object.

```ruby

# autosuggest.rb
require "redis"

redis = Redis.new
redis.flushdb # Resets to a clean database

def clean_title(title)
    # Change to your needs
    title.downcase.gsub(/-/, " ").gsub(/[^0-9a-z ]/, "")
end

# Our list of products
products = [
  {id: 1, title: "Tommy's Ray Gun"},
  {id: 2, title: "1990 Blaster Ray!!"},
  {id: 3, title: "(Nuke) Bomb Gun #8"}
]

products.each do |product|
  puts "Processing #{product[:title]}..."

  # Clean the title, split up into parts
  clean_title(product[:title]).split(" ").each do |part|
      1.upto(part.length) do |len|
          next if len == 1 # So we do not have a key of 1 length

          # Output a piece of each part
          puts part[0...len]
      end
  end
end
```

If you run this into your terminal it should output:

```
> ruby autosuggest.rb
Processing Tommy\'s Ray Gun...
"to" "tom" "tomm" "tommy" "tommys" "ra" "ray" "gu" "gun"
Processing 1990 Blaster Ray!!...
"19" "199" "1990" "bl" "bla" "blas" "blast" "blaste" "blaster" "ra" "ray"
Processing (Nuke) Bomb Gun #8...
"nu" "nuk" "nuke" "bo" "bom" "bomb" "gu" "gun"
```



Here we can see how the script cleans the titles, then breaks them down to produce key names for Redis to use as we had hoped for in the planning section. Now, let's import this into Redis. Simply change line 27:

```ruby
# BEFORE
puts part[0...len]

# AFTER
redis.zadd "p:#{part[0...len]}", 0, "#{product[:title]}//#{product[:id]}"
```

This will now store the titles for the objects as planned into a sorted list on Redis, where common sets of parts will group objects together. Go ahead and run your script again.

```
> ruby autosuggest.rb
Processing Tommy's Ray Gun...
Processing 1990 Blaster Ray!!...
Processing (Nuke) Bomb Gun #8...
```

Login to Redis and let's check if it works as planned. Since this is a sorted set we need to use [ZRANGE](http://redis.io/commands/ZRANGE).

```
> redis-cli
127.0.0.1:6379> ZRANGE p:gun 0 -1
1) "(Nuke) Bomb Gun #8//3"
2) "Tommy's Ray Gun//1"
127.0.0.1:6379> ZRANGE p:nuke 0 -1
1) "(Nuke) Bomb Gun #8//3"
```

Awesome, it works! We now have sorted sets with groups of products based on parts of the words in the object titles.

## Frontend

Now that we have a script (that you should expand on into a proper lib), we need to now show results to the user for when they're searching.

Here's a quick Sinatra example (of course you can use more advanced techniques as well)

```ruby
require "redis"
require "json"
require "securerandom"
require "sinatra/base"
require "sinatra/jsonp"

module YourApp
  class AutoComplete < Sinatra::Base
    helpers Sinatra::Jsonp

    configure {set :redis, Redis.new}

    get "/" do
      # Clean the query and get each word
      sets = []
      clean_query(params["q"]).split(" ").each {|word| sets << "p:#{word}"}

      # Get the common results in a temporary key
      tmp_key = "tmp_#{SecureRandom.uuid[0...8]}"
      settings.redis.zinterstore tmp_key, sets
      results = settings.redis.zrange tmp_key, 0, -1
      settings.redis.del tmp_key

      # Output results as JSON to browser
      jsonp results.to_json
    end

    private
    def clean_query(query)
      # Remove all special characters and adjusts naming
      query.downcase.gsub(/-/, " ").gsub(/[^0-9a-z ]/, "")
    end
  end
end
```

By calling `/?q=some+text`, we create a key for each word passed. So `some+text` goes into the `sets` variable and becomes `["p:some", "p:text"]`.

Next, we create a temporary key to use with [zinterstore](http://redis.io/commands/ZINTERSTORE) which computes intersection between keys (our `p:some` and `p:text`). This finds products that have both the words some and text in their title. We then use zrange to get the result of the intersection and delete the temporary key.

Finally, send the results as JSON. You can use AJAX to actively call the Sinatra app when the user is typing.
