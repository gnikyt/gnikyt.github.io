---
layout: post
title: 'Guts: With multisite'
permalink: guts-now-with-multisite
date: '2016-04-24 23:38:00'
---

This is just a quick and proud update that I've released a lengthy update to [Guts](https://github.com/gnikyt/guts) which includes multisite abilities. Meaning, you can run the same Guts admin interface for multiple domains. It also includes a handy concern for enabling multisite support on your application.

Right from the docs is the full details below. Besides that, I've introduced a `CHANGELOG` file, multiple fixes, and more tests from the [multisite pull request](https://github.com/gnikyt/guts/pull/1). The Gem is now at version `1.1.0` with a passing build. As a cool note, because Guts is on [rubydoc.info](http://www.rubydoc.info/gems/guts/1.1.0), you can open your favorite doc app like [Dash](https://kapeli.com/dash), and pull the full documentation.

## How It Works

All models for Guts except for Groups, Users, and Sites, have a `default_scope` which scopes the queries to the current domain.

So using for example, `Guts::Content.all` will show all content for the current domain only.

## Getting Started

### Admin Setup

Open Guts' dashboard and head to `Sites` in the sidebar. From here, there are two ways to handle your situation...

1. The current domain is the "default", you add the extra domains
2. No current "default", you add a default domain and the extra domains

In most cases, you'll use options one and have `example.com` pointing for Guts (meaning you don't add it in the section of the site), then you'd add your secondary domains such as `fr.example.com`.

### Code Setup

Open your `application_controller.rb` file and add `include Guts::MultisiteConcern`.

This will do two things:

1. Adds a `before_action` to set the current site (`@current_site`) based on the domain, which is also usable in your views
2. Adds a `around_action` which tells the `Site` model which site ID we're requesting so the models can be scoped to only show data for the current site.

For more insight into this concern see `app/concerns/guts/multisite_concern.rb` or view the YARD documenation.

## Misc. Notes

### "Set as Default" option

The `Set as Default` option the in sites section internally means nothing to Guts. It simply flags the site a boolean value to determine if you've set it as the default which you can then use in your application (maybe to query it, etc).

### Users & Groups

Currently, multisite support does not scope users and groups. This means the same users and groups will appear in all domains.

### Unscoping

Because for most models, a `default_scope` is provided, you may wish to remove this scope in some use-cases (such as pulling content from all sites, not just the current site). Simply add `unscoped` to your ActiveRecord queries.

```ruby
# For current site
Guts::Content.where(type: @type)

# For all
Guts::Content.unscoped.where(type: @type)
```
