---
layout: post
title: Moving away from CanCanCan to Pundit
permalink: moving-away-from-cancancan-to-pundit
date: '2017-03-30 00:00:00'
---

## What is Pundit & CanCanCan

[Pundit](https://github.com/elabs/pundit) is a simple, platform-agnostic, plain-ol-Ruby authorization library. It provides a set of helpers to get authorization done simply no matter if its plain Ruby, Sinatra, or Rails.

[CanCanCan](https://github.com/CanCanCommunity/cancancan) is a fork of the original CanCan Gem for Rails. CanCanCan, like Pundit, is an authorization library. Its specifically designed for Rails and provides a set of baked-in helpers to authorize models and controllers within Rails.

## Inner Workings

Pundit relies on POROs… "Policy" classes. Each model can have a policy where you can define the methods accessible to the object attempting to access it (a user, a group, …). Each policy can have its own scope as well, for example, an "admin" scope can see all entries in the database, while a "manager" can only see published entries in the database.

```ruby
class ArticlePolicy
  #...
  def create?
    # Only admins can create articles
    user.role? :admin
  end
  
  #...
  class Scope
    #...
    def resolve
      if user.role? :admin
        scope.all
      else
        scope.where(published: true)
      end
    end
  end
end

class ArticleController
  #...
  def index
    @articles = policy_scope(Article)
  end
  #...
end

#...

<%= link_to('Add Article', new_article_path) if policy(:article).create? %>
```

So in the above example, we set up our simple policy. All policy methods return a boolean to determine if the object requesting access can perform the action. In the controller, we scope the articles using the scope defined in the policy. Then in the view, we can call the Article's policy and check if the current user is able to create an article. Very clear logic.

CanCanCan, in all my past experiences, relies on a single Ability class tied to the object we're checking authorizations on. Its DSL is very simple and effective.

```ruby
class Ability
  #...
  if user.role? :admin
    can :crud, :all
  elsif user.role? :manager
    can :read, Article, published: true
    can [:update, :edit], Article, user: { id: user.id }
    can :destory, Article
  end
  #...
end

#...

<%= link_to('Add Article', new_article_path) if can? :create, Article %>
```

So in the above example, the user's abilities will be defined by the class. Scoping can be handled here as well. In the view, we then check if the user is able to create an article.

## Why I Switched

I'm currently reviewing my own CMS' pull request for moving to Pundit. [It is a long one](https://patch-diff.githubusercontent.com/raw/tyler-king/guts/pull/9.patch)… but worth it.

CanCanCan is awesome. It provides quick boilerplate to bust out an authorization system that ties into Rails nicely. However, once you start getting into complex authorizations, it becomes cumbersome to manage.

You start the need to do complex scoping which you then need to offload scoping logic into the model. You start to have many conflicting and confusing `can` and `cannot` statements. You start to have a growing ability file that has everything mushed together and it becomes hard to read. Controllers start to have a lot of authorization magic happen which sometimes needs to have an override.

Eventually its a mess. Yes, you can spend time separating CanCanCan into more manageable pieces but then you look at Pundit, which does this already.

With Pundit… everything has its own class, a simple PORO, and their own scopes… very easy to look up and see at a glance what is happening. Although with Pundit you are writing more explicitly in the controllers, it's actually more beneficial because another person can easily read your controllers/views and know exactly what's happening without "magic" that comes with CanCanCan.

I simply switched because I felt Pundit is more manageable and a better long-term solution than CanCanCan. I now have more readable code, more maintainable code, and code that's easily overridable by others.

## When to use each

Both libraries are great and both get the job done. In my opinion, if you need something quick and don't have a lot of logic at play, CanCanCan will fit right in your flow. If you want more fine-grained control and separation, give Pundit a try!

Either way, with both, you will not be disappointed. Both libraries are well documented, well written, and contribute greatly to the Ruby and Rails communities.
