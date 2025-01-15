---
layout: post
title: Setting Up Lumen with Redis
permalink: setting-up-lumen-with-redis
date: '2017-11-19 11:43:01'
---

This is more of an extension of my previous post "Setting Up Lumen + Mail". I wanted to take it a step further and show the basic setup for getting Redis to work, so you can queue not only mail, but jobs.

First, run `composer require illuminate/redis:5.5` to grab the Redis components.

Next, open `app/Providers/AppServiceProvider.php` and add the following to the `register` method:

```php
<?php
// ...

// Configs
$this->app->configure('database');

// Enable queues
$this->app->make('queue');
```

Next, create `config/database.php` and add the following:

```php
<?php

return [
  'redis' => [
    'client' => 'predis',
    'default' => [
      'host' => env('REDIS_HOST', '127.0.0.1'),
      'password' => env('REDIS_PASSWORD', null),
      'port' => env('REDIS_PORT', 6379),
      'database' => 0
    ]
  ]
];

```

Don't forget to set up all your environment variables for Redis, as well, to enable Redis for job processing and cache, set the following environment variables:

```conf
CACHE_DRIVER=redis
QUEUE_DRIVER=redis
```

That's it! You can now queue mail or process jobs.
