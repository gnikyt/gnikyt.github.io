---
layout: post
title: Journey to Sucker Punch
permalink: journey-to-sucker-punch
date: '2016-11-26 01:06:21'
---

Background jobs are great. Mailing, data processing, image processing, database operations… you name it. If its a repetitive blocking process for the user and its not time-sensitive, then its probably suited to be moved to a job.

## delayed_job

My go-to ActiveJob adapter for Rails has always been [Delayed Job](https://github.com/collectiveidea/delayed_job). Delayed Job is an extracted method from Shopify (which I highly doubt Shopify uses anymore) to manage background jobs. It uses the existing database by adding a `delayed_jobs` table which contains the jobs to process. It is extremely easy to set up and reliable and also requires no other external dependencies to operate.

I've never cared much about the performance of a job adapter simply because I'd normally push up a small, single app, to a single DO server; plenty of resources to play with. But recently, the performance came into mind when a rewrite of two apps for a client started maxing out the tiny memory of a DO server when I would deploy the code. Sure, I could just as easily hit resize and grab more memory, but I wanted to investigate the issue.

Checking `htop`, and sorting by memory, the second-highest memory consumer was `delayed_jobs`. Both instances of `delayed_jobs` were using 4.9% each so *9.8%* total of the available memory - this was simply *idling*. The apps themselves were using about 3.7% each so *7.4%* total. Combined, this is ~*17%* of the available memory just to run at a given time.

Investigating into `delayed_job`, it loads the entire Rails app. So essentially, each app is running twice, and on top of that, something polling the database to process the jobs. That's a lot going on just to process the small data the background jobs needed to do.

I had to look for another solution.

## resque & sidekiq

[resque](https://github.com/resque/resque) and [sidekiq](https://github.com/mperham/sidekiq) are widely used in the Rails world. They both rely on [Redis](https://redis.io/) as backend storage for job processing, unlike `delayed_job` which uses the database. I created a branch for both adapters to check out if they'd be a solid route to stick with. They were equally simple to set up and configure and with a few modifications to my Rails tests, they passed with flying colors.

I deployed both to the server to check out their performance, however, I found I did not gain. Checking `htop` once again, I found these adapters spawned processed which used roughly the same amount of memory as `delayed_job` did. I was told these adapters would have a better footprint, but it didn't seem to be the case and I'm not sure if something was configured incorrectly or not… I moved on either way.

## sucker_punch

[This is a Gem](https://github.com/brandonhilkert/sucker_punch) which I stumbled upon in my Feedly feed. It's written by [Brandon Hilkert](http://brandonhilkert.com). Sucker Punch is a single-process, asynchronous-processing library where the jobs are stored in memory and tied to the same application process - it lives with your app. This means it has no other external dependencies and is easy to setup. Once your app is fired up - so is `sucker_punch`. Now, `sucker_punch` is not a perfect solution… it does not retry jobs and if you shut your app down or reboot it while jobs are in the queue, they'd be lost. So this solution is good for non-critical, quick, jobs; perfect for these two apps.

I again created a branch, checked my tests, and deployed. I was happy with the results. The app's memory itself sits a little higher than before ~4.0-4.1% from 3.7% it was and Passenger Status reports roughly 75mb. Combined, both apps now utilize roughly 8% of the available memory compared to the 17% they used before. That's a good chunk saved!

So that was my journey through many ActiveJob adapters and settling on `sucker_punch`.
