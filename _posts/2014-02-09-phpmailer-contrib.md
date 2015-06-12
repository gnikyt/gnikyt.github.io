---
layout: post
title: 'PHPMailer Contrib'
date: '2014-02-09 17:25:00.000000000 -03:30'
categories:
    - Programming
tags:
    - code
    - contrib
    - github
    - php
    - update
---
Myself and a fellow developer were working on updating a two/three year old plugin we developed for Wordpress this week. Its a fairly complex plugin which in one of its functions, relies on getting the recipients of e-mails sent out by Wordpress.

During our upgrading of the code, we discovered [PHPMailer](http://phpmailer.worxware.com/) (the component Wordpress uses for mailing [wp_mail](http://codex.wordpress.org/Function_Reference/wp_mail), has been changed since we last wrote the plugin. The class properties "to", "bcc", "cc", "ReplyTo", and "all_recipients" of PHPMailer went from public to protected over the last couple years.

So our issue was `$mailer->to` simply wouldn't work anymore, and there appeared to be no public access methods to get the addresses such as `$mailer->getToAddresses()`.

I addressed the issue on PHPMailer's Github page, and [provided a pull request which has been merged into the master](https://github.com/PHPMailer/PHPMailer/issues/180) :) So in short, you can now access "to", "bcc", "cc", "ReplyTo", and "all_recipients" by using `getToAddresses()`, `getBccAddresses()`, `getCcAddresses()`, `getReplyToAddresses()` and `getAllRecipientAddresses()`.