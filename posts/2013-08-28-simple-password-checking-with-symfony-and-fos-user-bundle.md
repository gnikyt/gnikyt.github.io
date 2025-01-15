---
layout: post
title: Simple password checking with Symfony and FOS User Bundle
permalink: simple-password-checking-with-symfony-and-fos-user-bundle
date: '2013-08-28 16:22:49'
---

Recently for a project, a co-developer wanted to validate someone's record in the database from an Android application and the website was using Symfony 2.3 with FOS User Bundle. Specifically, this developer did not want to log the user in, only to check their login against the database. So this seemed like a special enough case to show my solution to the problem.

We were going to tackle this by an HTTP POST request to /login_check, with the user's email and password. Now, FOS User Bundle is highly configurable. At first, I considered extending the authentication handler and tapping into `onAuthenticationSuccess` and `onAuthenticationFailure`. By extending the authentication handler, I could now check for an external request from the Android application, and provide a JSON response for the POST data - showing if it was a valid login or not.

This provided a problem however, FOS User Bundle uses CSRF tokens on the login to prevent these kinds of HTTP requests, which is nice. But, to disable it so the Android application could externally call /login_check on the website, I would have to extend the security form controller for FOS User Bundle in SecurityController.php, and to do that you need to create a new bundle which is a child of FOSUserBundle. On top of that, then we have a security issue where we have no CSRF protection.

That's a lot of work just to respond to a HTTP request and let the application know of the email and password match the database.

So my solution was simple; take the user's email, validate it, then take the password and use Symfony's encoder service to hash the password sent to the controller for that email and check if it's valid.

Here is the controller code below. In my code, I added an "android_secret" parameter read from app/parameters.yml which is a hash that just ensures the request came from the Android application - this is unnecessary and can be removed if you please.

```php
<?php

namespace Acme\WebsiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AndroidController extends Controller
{
  public function checkLoginAction(Request $request)
  {
  // Get our POST data.
    $email    = $request->request->get('email');
    $password = $request->request->get('password');
    $secret   = $request->request->get('secret');

  // Setup the JSON messages.
    $messages = [
      'success' => [
        'success' => true,
        'message' => 'VALID_LOGIN'
      ],
      'fail'    => [
        'success' => false,
        'message' => 'INVALID_LOGIN'
      ],
      'secret'  => [
        'success' => false,
        'message' => 'INVALID_AUTH'
      ]
    ];

    $type           = 'application/json';
    $return_success = json_encode($messages['success']);
    $return_fail    = json_encode($messages['fail']);
    $return_secret  = json_encode($messages['secret']);

  // Ensure this is from the Android application.
    if ($this->container->getParameter('android_secret') !== $secret) {
      return new Response($return_secret, 200, ['Content-Type' => $type]);
    }

  // Check the email sent to us.
    $user = $this->get('fos_user.user_manager')->findUserByEmail($email);
    if (null === $user) {
      return new Response($return_fail, 200, ['Content-Type' => $type]);
    }

  // Email passed. Let's encode the password sent to us using the user's salt.
    $encoder      = $this->get('security.encoder_factory')->getEncoder($user);
    $encoded_pass = $encoder->encodePassword($password, $user->getSalt());

  // Check if the password sent to us matches encoded_pass we just created.
    if ($encoded_pass === $user->getPassword()) {
    // Passed!
      return new Response($return_success, 200, ['Content-Type' => $type]);
    }

  // Failed!
    return new Response($return_fail, 200, ['Content-Type' => $type]);
  }
}
```
