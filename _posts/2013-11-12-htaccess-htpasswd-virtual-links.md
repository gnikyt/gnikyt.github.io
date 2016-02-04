---
layout: post
title: 'Htaccess, Htpasswd & Virtual Links'
date: '2013-11-12 18:05:06.000000000 -03:30'
categories:
    - Programming
tags:
    - apache
    - problem
    - server
    - solved
    - work
---

**UPDATE: This will only work on Apache less than 2.3**

Password protected virtual URLs is a great way for small sites to protect a certain area from the public. But keeping them protected is an _overlooked issue_.

In my case, I created an Awiz-clone (adult content manager) for an adult-themed website I recently completed in Silex. The site featured a virtual path of "__/members/*__" which housed the private ccBill-member-only content. Because this is not an actual directory and instead a virtual URL, I had to use my main __.htaccess__ file to handle the authentication...

## What's the first step to protect?

Using __mod_env__, I checked if the incoming __REQUEST_URI__ matches the virtual-url of __/members__ and assigned it the name of __SECURED__

{% highlight conf %}
SetEnvIfNoCase Request_URI "^/members" SECURED
{% endhighlight %}

Next, I setup the standard Auth notations

{% highlight conf linenos %}
AuthGroupFile /dev/null  
AuthUserFile /home/xxx/public_html/cgi-bin/ccbill/password/.htpasswd  
Require valid-user
 
Order allow,deny  
Satisfy any  
Allow from all
{% endhighlight %}

Then I tell Apache to __Deny__ anyone who is accessing the __mod_env__ declaration of __SECURED__ if they are not authenticated.

{% highlight conf %}
Deny from env=SECURED
{% endhighlight %}

## Great, it works! So what's the issue?

You may notice that you are able to login to the page (given you setup the htpasswd with some dummy logins). The issue is not __logging in__ but __cancel__ing.

Go ahead, visit your secure page, but this time, enter nothing and click __cancel__. Oops! Your page appears!

## How do we solve this?

Provide a __ErrorDocument__ to handle Apache's 401 status.

After your mod_env declaration, simply add something like...

{% highlight conf %}ErrorDocument 401 "<meta http-equiv=\"refresh\" content=\"0;url=/register\">"{% endhighlight %}

Upon cancel and Apache throwing a 401, it will load the HTML provided there and redirect the user to a register page. If you would like to direct the user to a physical file on the server simple do...

{% highlight conf %}ErrorDocument 401 /register.php{% endhighlight %}

So there you have it. Adding __ErrorDocument__ to your protected virtual URL will ensure no one can still see it's contents when they click cancel. Its also a great way to direct members to a register page, or to any other "not authorized" page you require to show.

In full here is the compiled htaccess code:  

{% highlight conf linenos %}
SetEnvIfNoCase Request_URI "^/members" SECURED
ErrorDocument 401 "<html><meta http-equiv=\"refresh\" content=\"0;url=/register\"></html>"
AuthGroupFile /dev/null
AuthUserFile /home/xxx/public_html/cgi-bin/ccbill/password/.htpasswd
Require valid-user
Order allow,deny
Satisfy any
Allow from all
Deny from env=SECURED
{% endhighlight %}