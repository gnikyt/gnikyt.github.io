---
layout: post
title: Qr Code Gradients
permalink: qr-code-gradients
date: '2013-07-13 16:25:58'
---

Qr codes and matrices are a great way to share content to an audience, it allows anybody to simply put their phone up to the Qr image, scan it, and see what's inside. The premise of QrInColor.com was to provide a free way for users to not only create linked Qr codes, but to customize them as well - with color

For the QrInColor.com web-application initially we used [Endroid Qr Bundle](https://github.com/endroid/EndroidQrCodeBundle), when we re-vamped the look and features of the app into [Symfony](http://symfony.com) from [Silex](http://silex.sensiolabs.org/), we wanted to allow users to generate not only colored Qr codes, but two-tone gradient colors as well. I wanted to accomplish this without modifying the Endroid package as its not really it's purpose to do such a thing.

This created a problem... _how do I create a gradient on the Qr code?_ I came up with a solution: colorize the Qr with [Imagick](http://www.imagemagick.org/script/index.php) using their top and bottom colors the user picked then, "blend" the two images together to create a gradient effect.

![qr code base](/assets/images/0000/qr.png)

We would first take the Qr data the user entered and generate a black, basic, Qr code. Which is our canvas to work with. Now, we had to apply their top color chosen (RGB) to the base Qr and render it, using similar shell command below.

```bash
/usr/bin/convert qr.png -fuzz 60% -fill 'rgb(161,161,163)' -opaque black qr_top.png
```

![qr code top](/assets/images/0000/qr_top.png)

This is the result of the above command. It replaces all __black__ with a fuzz of __60%__ threshold with the color chosen by the user, __rgb(161,161,163)__.

It's nothing spectacular; but it works. Now, we need to do the same for the bottom color the user chose. Again we use the base Qr render to apply the color to.

```bash
/usr/bin/convert qr.png -fuzz 60% -fill 'rgb(248,150,39)' -opaque black qr_bottom.png
```

![qr code bottom](/assets/images/0000/qr_bottom.png)

This is the result of the above command. It replaces all __black__ with a fuzz of __60%__ threshold with the color chosen by the user, __rgb(248,150,39)__.

Finally, we need to blend them together as if they we're two layers in gimp. To accomplish this, we need to set the gray Qr we just rendered, to go from a gray color to complete transparency.

```bash
/usr/bin/convert qr_top.png -size 150x150 gradient: -compose copy_opacity -composite qr_gradient.png
```

This creates the effect we are looking for. Color at top, transparent at bottom. Now we place the gray transparent Qr on top of the orange Qr. Finally, here is the result!

```bash
/usr/bin/composite qr_bottom.png -compose Dst_Over qr_gradient.png result.png
```

![result](/assets/images/0000/qr_together.png)
![result 2](/assets/images/0000/qr_together_2.png)

Unfortunately, I did not choose very vibrant colors to blend (gray and orange) but the effect is there, I've included another example with _two better colors_. Now, I'm sure there are better ways to produce these gradients, but the point of this post is that there was a problem I faced with a client's website, I used my brain to come up with a solution and it worked. A road block can always be passed; just don't pass the ones with cops posted, that won't end well.
