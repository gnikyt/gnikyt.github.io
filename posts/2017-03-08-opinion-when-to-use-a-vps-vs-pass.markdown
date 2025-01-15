---
layout: post
title: 'When to use a VPS vs PaaS'
permalink: when-to-use-a-vps-vs-pass
date: '2017-03-08 11:12:00'
---

## Introduction

### What is a VPS

A VPS is a Virtual Private Server. A server running on more powerful hardware than the standard "shared hosting" plans (usually). Every "account" has its own physical space on the server in virtual compartments with super-level access. Software is set up independently in each space. It's like your own piece of pie on the server.

Most VPS providers offer both managed (host manages for you) or unmanaged (clean slate for you to break!) plans. There are many pricing levels and many providers. The top providers mentioned the past few years are:

+ [DigitalOcean](http://digitalocean.com) *(one I personally choose to use)*
+ [Linode](http://linode.com)
+ [Vultr](http://vultr.com)
+ [Scaleway](http://scaleway)

Each of these providers is great. They offer features such as instant upgrades, point-n-click setup of instances, pre-bundled setups, DNS configurations, IP management, backups, and more. Their prices are relatively the same as well.

For example, with DigitalOcean, on a $5 per month plan, you can get 512MB of RAM, 1 CPU, 20GB SSD space, and be up-and-running in minutes. This is a very cost-effective method for those who want to have freedom with their server to host their applications and websites.

The vast amount of tutorials and community support out there for these services make any modifications easy for even new-comers.

### What is a PaaS

PaaS or Platform as a Service is a cloud-computing service that provides a platform allowing customers to develop, run and manage their applications/websites without the complexity of building and maintaining the infrastructure associated with developing and launching.

With [Heroku](http://heroku.com) for example, you can set up an account in minutes, generate a [Procfile](https://devcenter.heroku.com/articles/procfile) for your app, and deploy your code through Git. Heroku will pull your code, read your Procfile, and build a system that suits your code, launching it mere minutes with no interaction on your part. It comes with several add-ons that are point-and-click setups like Redis, Postgres, Loader.io, and more.

These services allow you to focus on code, not the server. You don't need to worry about the command line, resource scaling, migrations, errors... its all taken care of you. This, of course, comes at a cost to you though compared to a VPS.

Heroku is billed by the usage time of the server (how long it's running). They have free hobby plans to get you going, but once you need more resources, the price will jump. A small app on Heroku could start out as $10 a month. A medium-sized medium-load app could quickly jump to $260 a month from experience.

### What to Choose

Well, it's up to your needs. Go "cheap", manage the server yourself, then you'd pick a VPS. Focus on code and not worry about the server, you'd pick a PaaS.

Personally, if its a minimal load and minimal traffic app, I'd spin up a DigitalOcean instance, spend the time to configure it properly, deploy the app and let it be. Sometimes, this is all the client is willing to afford anyways.

If its an app that is going to experience high traffic, high load, and needs to stay dependable… I'd choose a PaaS every time. I don't need to worry about recourses and I can easily scale the databases, CPU, RAM, etc. as needed with a click of a button. When it's crunch time... this can be a big help.
