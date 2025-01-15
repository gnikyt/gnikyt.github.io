---
layout: post
title: Thunderbird with GSuite & Exchange
permalink: thunderbird-with-gsuite-exchange
date: '2019-01-08 20:20:24'
---

Its true desktop clients are on the decline in favor of easily accessible web clients (such as GMail, Outlook.com). However, if you've ever used a complete native desktop client before such as the star of it all, Outlook, then you know nothing on the web can come close.

Besides the obvious dependability/extendability of endless settings you can tailor to your liking, desktop clients come with the added benefit of offline and powerful instant search. If you travel occasionally like me, doing work while up in the air is much easier when you have your entire mailbox, address book, and schedule in front of you.

## Why Thunderbird

Well, I'm on Linux to start, but its also a great well-tested application suite backed by Mozilla. It features a large helpful community, a wealth of add-ons, and its open-source. I considered using Evolution but it didn't quite meet my standards of needs. &nbsp;Other clients such as the popular Geary, are simply too basic to work with when you're dealing with business activities.

## Setup for GSuite

### Mail

Google implements its own standards when it comes to a lot of things, IMAP is one of them. Instead of folders, Google chose to implement "labels" which translates poorly on my clients.

Luckily Thunderbird handles this well. Simply add your Google account to Thunderbird as normal and configure the account settings to your liking.

### Calendar

You'll need two addons for this to work.

1. "Lightning" - The integrated calendar & scheduling addon for Thunderbird
2. "Provider for Google Calendar" - Allows bidirectional access to Google Calendar.

Once both are installed, simply click the menu icon for _Thunderbird \> "New Message \>" \> Calendar..,_ to open the calendar dialog. From here, select "From network...", then "Google Calendar". You should now be able to enter your Google account information and your calendars will sync.

### Contacts

For contacts, you'll need to install "gContactSync". Once installed, click the menu icon for Thunderbird, go to _Addons \> gContactSync._ Enter your Google account information, choose the lists you wish to sync, and hit save.

This addon does support contact photos as well.

## Setup for Exchange / Outlook

### Mail

Thunderbird supports this out of the box, if you're using Outlook.com you may need to generate an app password for your account to connect. Enter your account information and your mail will begin to sync.

### Calendar & Contacts

For this to work, you'll need the following addons:

1. "TbSync" - Sync contacts, tasks, and calendars for Exchange
2. "Provider for Exchange" - Adds sync support for Exchange accounts for TbSync
3. "Lightning" - The integrated calendar & scheduling addon for Thunderbird

Once installed, click the menu icon for Thunderbird, go to _Addons \> TbSync \> Account Actions \> Add a new account_. Enter your account information and a dialog will appear allowing you to select which contact lists to sync and which calendars to sync. Once chosen, click "Synchronize this account".

Done! Now your contacts and calendars will appear once syncing is complete.

One note, the contact images do not seem to work though (for me)...

## Screenshots or it didn't happen

Fine!

[![](/assets/images/2019/01/Screenshot-from-2019-01-08-16-18-03.png)](/assets/images/2019/01/Screenshot-from-2019-01-08-16-18-03.png)

[![](/assets/images/2019/01/Screenshot-from-2019-01-08-16-18-56.png)](/assets/images/2019/01/Screenshot-from-2019-01-08-16-18-56.png)

[![](/assets/images/2019/01/Screenshot-from-2019-01-08-16-18-06.png)](/assets/images/2019/01/Screenshot-from-2019-01-08-16-18-06.png)
