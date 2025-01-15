---
layout: post
title: Developing Shopify themes with teams
permalink: developing-shopify-themes-with-teams
date: '2014-09-16 22:17:10'
---

This is a simple write up to explain how a team can utilize Git versioning to manage a Shopify theme successfully. It's not a complicated process but will require patience! As a side-note, this is simply a personal recommendation based on my experiences, there are of course other ways to go about this process.

## Step One: Installing Shopify's Theme Manager

No, not the GUI - that doesn't work very well for what we need to do (many GUIs don't!). What you're going to do instead is open your Terminal.

Run `gem install shopify_theme` - it's Shopify's Ruby Gem for managing themes with advanced options.

![terminal shopify](/assets/images/0000/shopify-1.png)

## Step Two: Creating your own shop

##### Citation: This is only my personal recommendation

Each developer working on the theme will need _their own shop_ to push changes/to test changes. Because we can not run Shopify locally, we need to view it somewhere and the problem is that multiple developers can not push changes to the same shop because we will overwrite each other and create a mess.

So creating your own shop will allow each developer to be independent but still work on the same codebase.

It's time to register a private app in your development shop to let the Shopify Theme Manager communicate. Go to __https://[your store].myshopify.com/admin/apps/private__ and generate a private application; call it anything you like… "Theme Dev", "Rickyisms", doesn't matter. What Shopify will give you API information. __Keep that API key and password on hand for step three__.

![api setup](/assets/images/0000/shopify-2.png)

## Step Three: Setting up the theme files

### __Step Three-A: Setting up a new dev theme__

__If there is no theme created for your development team yet__, simply open the Terminal and cd into the directory where you wish to develop.

![terminal output](/assets/images/0000/shopify-3.png)

Now that we're in our place of development, let's pull Shopify's Timber theme using the gem.

Run `theme bootstrap api_key password shop_name theme_name master`

- Replace __api_key__ in the command with the API key you had in step two
- Replace __password__ in the command with the API password you had in step two
- Replace __shop_name__ in the command with the Shopify URL of your shop
- Replace __theme_name__ in the command with what you will name the theme

![theme setup output](/assets/images/0000/shopify-4.png)

In my case, I called my theme __porte_mode__. This command will do three things…

- Create you a __config.yml__ which Shopify Theme Manager uses to connect to your shop
- Download the latest Timber theme files
- Publish them to your shop

Now that we have Timber ready and registered with our dev shop we can go ahead and get this baby up on Github/Bitbucket (keep the repository name the same as your theme name).

Be sure to create a __.gitignore__ file and add __config.yml__ to it. This ensures no developer's Shopify Theme Manager configurations will clash when working on the repository code.

![theme gitignore output](/assets/images/0000/shopify-5.png)

Now commit this code to the repository (ex: `git add -A && git commit -m “First commit” && git push -u origin master`).

That's it. In under 5 minutes, you're ready to develop with other developers. A review of what we did…

- Chose a development location locally
- Pulled Timber theme from Shopify using __theme bootstrap__
- Setup our configuration
- Created a Git Ignore file
- Pushed the first commit to GitHub/BitBucket

_Note: You may need to publish the newly uploaded theme in your Shopify backend to see it._

### __Step Three-B: Using an already created dev theme__

__If a developer has made a dev theme for this project on GitHub/Bitbucket already,__ simply clone it (ex: `git clone git@bitbucket.org:[your-username]/[theme_name].git</span>`)

Next, we need to configure Shopify's Theme Manager to use our dev shop. Open the Terminal to the repository location and run `theme configure api_key password shop_name`

- Replace __api_key__ in the command with the API key you had in step two
- Replace __password__ in the command with the API password you had in step two
- Replace __shop_name__in the command with the Shopify URL of your shop

After this is done, run it. Last but least, push the theme code to your dev shop. Open the Terminal and run `theme replace` this will push all changes and register the theme on your shop (this command will take some time).

![theme replace output](/assets/images/0000/shopify-6.png)

That's it, you're done. In a couple of minutes, we've downloaded the dev theme from Github/Bitbucket and pushed it to our dev shop to work on.

_Note: You may need to publish the newly uploaded theme in your Shopify backend to see it._

## Using the Shopify Theme Manager

There are several commands we can use to manage the theme of your dev shop.

__Upload a theme file__

`theme upload assets/logo.gif`

- This is for uploading a single file to your dev shop

__Remove a theme file__

`theme remove assets/logo.gif`

- This removes a single from your dev shop

__Completely replace shop theme assets with the local assets__

`theme replace`

- This mass replaces everything in your dev shop with what's in your local repository. Useful for if you `git pull/fetch/merge` changes and want to push them to your dev shop.

__Watch the theme directory and upload any files as they change__

`theme watch`

- This actively watches your local repository for changes and automatically pushes these changes to your dev shop in the background.

## Final Thoughts

So that's it! This document simply outlines how to set up a development theme on GitHub/Bitbucket and Shopify, how to pull a theme from Github/Bitbucket, and develop with it as well as a list of useful commands to manage the theme as a team.

The viewable Google Doc of this is available here: https://docs.google.com/document/d/1fRCxDG7fCE4YjCVSXFZ5CsGhhpvj-PgrDPauDdjrwW8/edit?usp=sharing

![yes!](/assets/images/0000/shopify-7.png)
