---
layout: post
title: Blink - Tuned camera notifications
permalink: blink-tuned-camera-notifications
date: '2022-11-28 15:47:22'
---

**Note**: This post is geared towards Android devices. Currently unaware of a solution for Apple devices.*

## The Problem

If you have a Blink setup at work or home, you've probably run into a common issue of getting notifications for cameras which you do not care to have notifications for. For example, you may have six cameras recording motion, but you may only care about receiving notifications for two of them; but with Blink's app, there is no way to control this.

It's all or nothing with Blink. This is because (at time of writing), Blink uses a single channel to push notifications to called `Motion detection`. Because of this, you are unable to silence notifications for specific cameras, you only have the option of silencing the whole notification channel, which would leave you without **any** motion notifications to your device.

## Solutions

### Snoozing

Since an update earlier this year, Amazon has added a snooze feature displayed as an icon next to each camera's name.

Clicking the icon will give you options to snooze notifications for 1, 2, 3, or 4 hours.

This seemed like a viable solution on the surface, but in practice, it fails. Even with selecting 4 hours, it appears to be bugged... I would get notifications just 20 minutes later, but the snooze icon would still be active. Additionally, repeating this action for every camera, every 4 hours, was a little annoying.

Given it was buggy and was not automated, I abandoned this as a solution. Plus, why couldn't Amazon add a *"Until I turn off"* option to the list of times? That would be an ideal built-in solution.

### Macrodroid

I previously installed an app called [Macrodroid](https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid&hl=en_CA&gl=US&pli=1), for automating some "Do Not Disturb" rules.

Macrodroid is similar to the popular Tasker app for Android. These are apps which allow you to automate your phone based on triggers or actions performed.

In digging more into the offered triggers for Macrodroid, I discovered it had a feature to read notifications instantly and perform an action on them.

With some trial and error, I was able to build a macro in the app which would watch for a notification containing the camera names, and then running an action to clear those notifications.

**It worked!** The instant a notification comes in for one of the cameras I wish to ignore notifications for, it clears it out so I never have to see or hear it.

#### Setup

1. Install Macrodroid
2. Go through the setup and enable the correct permissions for app overlays, notification access, etc.
3. Click **Add Macro**
4. In the **Triggers** panel, click the **+** icon
5. From the list, select **Notifications**
6. Select **Notification Received** for the event option
7. Select **Select Applications(s)** then choose **Blink** from the list
8. Set for text contains to be:
  - `Motion detected at your [CAMERA_NAME]`
  - Replace `[CAMERA NAME]` with the camera's name
  - Example: `Motion detected at your Porch` 
9. Save, then in the **Actions** panel, click the **+** icon
10. Select **Notification** from the list
11. Select **Clear Notifications** from the secondary list
12. Select **Select Application(s)** then choose **Blink** from the list
13. Set for text contains to be:
  - `Motion detected at your [CAMERA_NAME]`
  - Replace `[CAMERA NAME]` with the camera's name
  - Example: `Motion detected at your Porch` 
14. Check off **Ignore ongoing notifications**
15. Save, then save the macro with a desired name

#### Result

Once configured, your macro should be similar to this:

![Macro](/assets/images/posts/blink.png)

You can additionally use regular expressions on the text contains input to apply it to multiple camera names, or you can duplicate the macro and change the text contains for each camera... both options work fine in my testing.

## Conclusion

Until Amazon adds the ability to snooze notifications indefinitely or adds notification channels per camera, then the best option is to take advantage of Macrodroid. With the macro, you will no longer receive notifications for those specific cameras, but still allow them to stay enabled and record motion.