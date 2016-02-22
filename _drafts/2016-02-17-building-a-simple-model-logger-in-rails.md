---
layout: post
title: 'Building a simple model logger in Rails'
date: '2016-02-17 23:06:32'
categories:
    - Programming
    - Ruby
tags:
    - ruby
    - rails
---

ActiveRecord comes with many built-in [callbacks](http://api.rubyonrails.org/classes/ActiveRecord/Callbacks.html) a developer can utilize in their applications which allow you to hook in logic before or after a change to an object record.

Recently I came across the need to use these callbacks in a unique way for my CMS port, a Rails-mountable CMS engine called *Guts*. I needed a very basic *activity tracker/log* which would highlight the creation, update, and deletions of records, nothing fancy. The simplest way to achieve this was through these callbacks.

## The Planning

As in anything programming — everyone has their own methods and ideas of coming to a solution. It was a quick decision where I decided to go the route of using model concerns to abstract the code into a unified place. I had several thoughts in my head on what I wanted this concern to tackle:

1. Track creation
2. Track updates
3. Track deletion

With that in mind; essentially, I would now need to apply this concern to any model I want to track and log it to a separate table in the database.

## The Basic Concern

First thing I did was create a concern called `trackable_concern.rb` in `app/concerns` but you can also use Rails' default of `app/models/concerns`. Lets layout some logic to tackle our goals outlined in the plan.

``` ruby
# app/concerns/guts/trackable_concern.rb
module Guts
  module TrackableConcern
    extend ActiveSupport::Concern

    module ClassMethods
      def trackable(*types)
        types.each do |type|
          self.send :"after_#{type}" do
            Tracker.create(action: type, object: self)
          end
        end
      end
    end
  end
end

```

In the above code for the concern, I utilize `ClassMethods` to allow each model to use `trackable` much like how a modal can use `has_secure_password` or `has_many`.

Next, I tell the `trackable` method to expect a list of types (callback types). This way, we can hook into more than one callback from the get-go. Each callback type will be looped, and the [send](http://ruby-doc.org/core-2.3.0/Object.html#method-i-send) method will be used to invoke the `after_{X}` callback. If we did `trackable :update, :destroy` then the `send` method would invoke `after_update` and `after_destroy` on the model itself.

In the block for each type/callback, I call my `Tracker` model (which is not-yet created) and tell it to log two values to the database

1. The action AKA `type`
2. object aka `self` (which is a [polymorphic reference](http://guides.rubyonrails.org/association_basics.html#polymorphic-associations))

## The Model

The basic code for the concern logic is in place, lets create the model for `Tracker` we referenced in the concern.

``` shell
rails g model Tracker action:text object:references{polymorphic}
```

This will create `app/models/tracker.rb` (or in my case `app/models/guts/tracker.rb`) for us as well as a migration which looks something like the following:

``` ruby
# app/db/migrations/20160128041750_create_guts_trackers.rb
class CreateGutsTrackers < ActiveRecord::Migration
  def change
    create_table :guts_trackers do |t|
      t.references :object, polymorphic: true, index: true
      t.text :action
      t.timestamps null: false
    end
  end
end

# app/models/guts/tracker.rb
module Guts
  class Tracker < ActiveRecord::Base
    belongs_to :object, polymorphic: true
  end
end
```

Running `bundle exec rake db:migrate` will complete the job by creating the table in our database.

## Using the Concern

To use the concern in models you wish to track you open the model and include the concern and state which hooks you wish to use. As example:

``` ruby
# app/models/guts/category.rb
module Guts
  class Category < ActiveRecord::Base
    #... etc ...
	include TrackableConcern
    #... etc ...
    trackable :create, :update, :destroy
  end
end
```

Now anytime a `Category` is created, updated or destroyed, the tracker will log this into the database.

| action | object_id | object_type    |
| ------ | --------- | -------------- |
| update | 2         | Guts::Category |

