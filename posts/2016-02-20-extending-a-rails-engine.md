---
layout: post
title: Extending a Rails Engine
permalink: extending-a-rails-engine
date: '2016-02-20 12:27:45'
---

Redesigning my CMS in Rails has been great fun. There have been many challenges faced, and many conquered (like having 100% code coverage :D). One thought that crossed my mind after building the monster was how do you extend an engine? By extending, I mean to add or overwrite methods of controllers, models, helpers, etc.

The [Rails Engine Guide](http://edgeguides.rubyonrails.org/engines.html#improving-engine-functionality) is excellent and it has two main points on extending the engine functionality. One is by use of "decorators" and the other is by abstracting all your controller and model code into concerns inside your engine. While I like the concern method, as it gives more flexibility for complex extensions, its overkill in my opinion. The [decorator](http://edgeguides.rubyonrails.org/engines.html#overriding-models-and-controllers) option is very easy to implement without changing much of your existing engine.

The first step as the Rails guide shows you, is to add support for decorator loading inside your engine lib. Below is how I did it in my CMS engine called Guts:

``` ruby
# lib/guts/engine.rb
# ... etc ...
isolate_namespace Guts

config.to_prepare do
  Dir.glob("#{Rails.root}app/decorators/*/guts/*_decorator*.rb").each do |c|
    require_dependency c
  end
end
# ... etc ...
```

This will look for all decorators in the main Rails apps for the path `app/decorators/{controllers,models,concerns,helpers,etc}/guts/{file}_decorator(s).rb` and load them in using [require_dependency](http://apidock.com/rails/ActiveSupport/Dependencies/Loadable/require_dependency).

Now the engine has support to load the decorators, lets move on to some examples. All following examples from here-on-out will be using my engine for example purposes.

## Controllers

Create a file in `app/decorators/controllers/guts/` such as `type_decorator.rb`

Add in the following code using `class_eval` from Ruby:

``` ruby
Guts::TypesController.class_eval do
  # Decorator action is explode.. we will route this as: guts/types#explode
  def explode
    # Will render app/views/guts/types/explode.html.erb
  end
end
```

Next open `app/config/routes.rb` in your main Ruby app and prepend this new route at the **very top of the route file before mounting the Guts engine** in the `Rails.application.routes.draw` block.

As an example:

``` ruby
Guts::Engine.routes.prepend do
  # Create a route of /guts/types/explode
  # Map it to types controller and the explode method
  # Give the route a name of guts_types_explode
  get "/types/explode", to: "types#explode", as: :guts_types_explode
end

Rails.application.routes.draw do
  # Mount the Guts engine
  mount Guts::Engine => "/guts"
end
```

This will now prepend our new route to the engine and map `/guts/types/explode` to our decorator action.

Lastly, create a view in `app/views/guts/types/` called `explode.html.erb` with whatever you wish to display! This is the basics of extending a controller.

## Models

As in controllers, create a file in `app/decorators/models/guts/` such as `type_modal_decorator.rb`

Add in the following code using `class_eval` from Ruby:

``` ruby
Guts::Type.class_eval do
  # Override title setter
  def title=(title)
    self[:title] = "Tricked ya! New Title!"
  end

  # Adds a new method to the model
  def title_with_bang
    "#{self[:title]}!"
  end
end
```

## Views

As stated above for the controller example, since Rails looks in the main app for views first, you simply need to match the correct path.

If your engine's view for `CoolController#jumps` is `app/views/{engine}/cool/jumps.html.erb` you will duplicate this in your main Rails apps by creating a file in `app/views/{engine}/cool/jumps.html.erb`. You can then enter anything you need into that view and will be overridden.

A good tip I used in my CMS engine was to utilize [yields](http://guides.rubyonrails.org/layouts_and_rendering.html#understanding-yield). I placed named yields in many parts of my engine views so they can be utilized by a Rails app by calling [content_for](http://guides.rubyonrails.org/layouts_and_rendering.html#using-the-content-for-method) in their views.

Although the Rails Guide covers all this, I thought seeing a real-world example would help. Happy coding!
