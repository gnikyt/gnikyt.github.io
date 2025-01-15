---
layout: post
title: Polymorphic and Route Concerns... who is who?
permalink: polymorphic-and-route-concerns
date: '2016-01-01 12:55:00'
---

The goal of this post is to outline some tips on easily figuring out the parent object for a polymorphic modal/route/controller. Let's start with the basics...

## Polymorphic

For those unfamiliar to it, [Polymorphic is an Active Record](http://guides.rubyonrails.org/association_basics.html#polymorphic-associations) association type where a model can belong to other models. As a simple example, you could have an *Ingredient* model which can be polymorphic and belong to different types of models such as *Baking*, *Cooking*, or *WitchesBrew*.

## Route Concerns

These are used in routing for Rails where you're able to declare common routes for resources. An example of this can be a *picture* concern, where many resources can have a picture route.

```ruby
concern :picturable do
  resources :pictures
end
# ...
resources :users, concerns: [:picturable]
resources :customers, concerns: [:picturable]
```

## The problem

If your polymorphic modal has a controller, how do you know what object is using it? How do you get the object itself? Let's start and assume I have a polymorphic modal for Metafields, so many models can have metafields and we'll call it *fieldable*.

```ruby
# modals/metafield.rb
module MyCoolApp
  class Metafield < ActiveRecord::Base
    belongs_to :fieldable, polymorphic: true
  end
end
```

```ruby
# modals/user.rb
module MyCoolApp
  class User < ActiveRecord::Base
    # ...
    has_many :metafields, as: :fieldable, dependent: :destroy
    # ...
  end
end
```

```ruby
# modals/movie.rb
module MyCoolApp
  class Movie < ActiveRecord::Base
    # ...
    has_many :metafields, as: :fieldable, dependent: :destroy
    # ...
  end
end
```

So now, we have three models. The *Metafield* modal which is polymorphic and a *User* and a *Movie* modal which can have these metafields. The *Metafield* modal will create a table in the database with `fieldable_type` and `fieldable_id` which should reference the modal class and the object's ID.

Along with this, I've set up a Metafield controller so we can add, edit, and delete metafields for these other models. With all this put together, we'll set up the routing concerns.

```ruby
concern(:fieldable) { resources :metafields }
# ...
resources :users do
  concerns :fieldable
end
# ...
resouces :movies do
  concerns :fieldable
end
```

Now, the user and movie resource routes will have metafield resource routes added to them. Which will create routes such as `/users/metafields`, `/users/metafields/new`, `/movies/metafields/3/edit`.

However, for the metafield controller, how is it supposed to know if we're accessing User metafields or Movie metafields when you're adding and editing? You could do things such as base it on the URL, or manual section, but that's not a great solution in the long run. There are easier and cleaner ways... by utilizing a mix of the routing concerns and a private method in the Metafield controller. Let's change our concern in the routing now to accept options and parameters.

```ruby
# Before
concern(:fieldable) { resources :metafields }
# After
concern(:fieldable) {|opts| resources :metafields, opts}
```

Now let's pass a parameter to the concern per resource route.

```ruby
concern(:fieldable) {|opts| resources :metafields, opts}
# ...
resources :users do
  concerns :fieldable, fieldable_type: "MyCoolApp::Users"
end
# ...
resouces :movies do
  concerns :fieldable, fieldable_type: "MyCoolApp::Movies"
end
```

So now we're passing `fieldable_type` with the modal class to the concern which gets passed to the resource for metafields. We can now grab this parameter in the controller and it'll help us figure out what modal is trying to access the metafields. Let's add a method to the metafield controller now which will do this work for us.

```ruby
module MyCoolApp
  class MetafieldsController < ApplicationController
      before_action :set_object
      # ...
      
      private
      def set_object
        # Converts (as example) "MyCoolApp::Movies" string to "movies_id"
        param_name   = "#{params[:fieldable_type].demodulize.underscore}_id"
        
        # Converts (as example) "MyCoolApp::Movies" string into a module reference
        param_object = params[:fieldable_type].constantize
        
        # Grab the object now, as example: (object.find movie_id) -> MyCoolApp::Movies.find 3
        @object = param_object.find params[param_name]
      end
  end
end
```

As you can see above, everything is now in place. We convert the `fieldable_type` value we passed in the concern into a module reference and an ID for whose trying to access it. `@object` will not be the User object or Movie object trying to access the metafields.

Lastly, we can tie this into the forms for metafields creation/editing:

```html
# ...
<div class="hide">
  <%= f.text_field :fieldable_id, value: @object.id %>
  <%= f.text_field :fieldable_type, value: @object.class %>
</div>
```

Now when saved, the metafield record in the database will automatically set the modal class and the ID for the object.
