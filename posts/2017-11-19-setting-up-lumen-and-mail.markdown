---
layout: post
title: Setting Up Lumen with Mailer
permalink: setting-up-lumen-with-mail
date: '2017-11-19 11:04:33'
---

## What is Lumen

[Lumen](https://lumen.laravel.com/) is a micro-framework built by Laravel. Its geared towards small services like APIs, job handling, or very small projects. Laravel is all-inclusive, whereas Lumen is more bare-bones but moderately featured; however, it doesn't feel as lean as something like Slim.

## Setting Up Mailing

Recently I ported a small app from Sinatra to Lumen for trial with a client. Its a job processing app for Shopify, where it would take data from a webhook, process it with a worker, and send back some data later. It needed to be fast, as, like other webhook-focused apps, it has to keep up with the high demand.

One issue I ran into was mailing, it's not enabled by default in Lumen, and there are many posts throughout Google of people attempting to set it up. There are also many outdated ways which only worked for the old version of Lumen.

Through trial and error, I managed to find a working setup I thought I would share.

### Setup

First, run `composer require illuminate/mail:5.5` to grab the mailing component.

Next, open `bootstrap/app.php`, find `$app->register(App\Providers\AppServiceProvider::class);` and uncomment it, if not already.

After this is done, open the app provider in `app/Providers/`.

At the bottom of the `register` method, paste in the following:

```php
<?php
// ...

// Init mailer
$this->app->singleton(
    'mailer',
    function ($app) {
        return $app->loadComponent('mail', 'Illuminate\Mail\MailServiceProvider', 'mailer');
    }
);

// Aliases
$this->app->alias('mailer', \Illuminate\Contracts\Mail\Mailer::class);
```

To make mailing queue-able and able to be processed in the background, simply add:

```php
<?php
// ...

// Enable queues
$this->app->make('queue');  
```

And see my Lumen Redis tutorial to setup Redis for processing.

Next, setup the basic config `config/mail.php`:

```php
<?php

return [
    'driver' => env('MAIL_DRIVER'),
    'host' => env('MAIL_HOST'),
    'port' => env('MAIL_PORT'),
    'from' => [
        'address' => env('MAIL_FROM_ADDRESS'),
        'name' => env('MAIL_FROM_NAME'),
    ],
    'encryption' => env('MAIL_ENCRYPTION'),
    'username' => env('MAIL_USERNAME'),
    'password' => env('MAIL_PASSWORD'),
    'markdown' => [
        'theme' => 'default',
        'paths' => [
            resource_path('views/vendor/mail'),
        ],
    ],
];

```

That's it, you're done the setup! Don't forget to set up your environment variables for production.

### Creating a Mailer

Now that we're setup, you can create a mailer in `app/Mail/`, here's an example to go by (`app/Mail/Winnings`):

```php
<?php namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class Winnings extends Mailable
{
    use Queueable, SerializesModels;

    /** @var string the address to send the email */
    protected $to_address;

    /** @var float the winnings they won */
    protected $winnings;

    /**
     * Create a new message instance.
     *
     * @param string $to_address the address to send the email
     * @param float $winnings   the winnings they won
     * 
     * @return void
     */
    public function __construct($to_address, $winnings)
    {
        $this->to_address = $to_address;
        $this->winnings = $winnings;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->to($this->to_address)
            ->subject('Your winnings!')
            ->view('emails.winnings')
            ->with(
                [
                    'winnings' => $this->winnings
                ]
            );
    }
}

```

Now, create a view, `resources/views/emails/winnings.blade.php` for simply HTML-only,:

```html
{% raw %}<strong>You won {{ $winnings }}</strong>!{% endraw %}
```

## Sending Mail

Now that we have it setup, and a mailable created, we can send. In your job, controller, or where ever you need it:

```php
<?php
use App\Mail\Winnings as WinningsMail;

// ...
// $to_email = 'john@doe.com'; $winnings = 130.00;

Mail::send(
    new WinningsMail(
        $to_email,
        $winnings
    )
);
```

If you're queuing mail, replace `send` with `queue`. You can also see [Laravel's mail documentation](https://laravel.com/docs/5.5/mail#sending-mail) for more information on sending.

## Testing

Of course, we need to test (`tests/WinningsMailTest.php`):

```php
<?php

use App\Mail\Winnings;
use Illuminate\Support\Facades\Mail;

class WinningsMailTest extends TestCase
{
    public function testItWorks()
    {
        Mail::fake();

        Mail::send(
            (new Winnings('john@doe.com', 15.00))->build()
        );

        Mail::assertSent(Winnings::class, function ($mail) {
            return $mail->hasTo('john@doe.com') &&
                   $mail->subject === 'Your winnings!' &&
                   $mail->viewData['winnings'] === 15.00;
        });
    }
}
```

Running the tests should pass if everything is set up correctly. For more information on testing mailables, see [Laravel's documentation on faking](https://laravel.com/docs/5.5/mocking#mail-fake).

I hope this was a quick and useful setup for anyone having issues. Good luck!
