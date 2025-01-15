---
layout: post
title: Get original sized images from a Wordpress Post Gallery
permalink: get-original-sized-images-from-a-wordpress-post-gallery
date: '2014-11-08 20:36:59'
---

Recently, I was working on a project where I needed to modify an existing page that had multiple galleries. This change required me to have access to the original uploaded images. Here's a simple function I wrote which returns the images easily in an array format.  
  
```bash
# Input
Hey comes see my gallery! [gallery ids="12,124,342]

# Code
$images = getGalleryImages(get_the_content());

# Output
Array (
  [0] => http://xxxx/wp-content/uploads/2014/09/Olin_24_large.jpg
  [1] => http://xxxx/wp-content/uploads/2014/11/Jw_large.jpg
  [2] => http://xxxx/wp-content/uploads/2014/11/cresand-D_large.jpg
);
```

```php
/*
 * getGalleryImages
 *
 * Converts a WP gallery into an array of images to use.
 *
 * @param $content rendered content (ex: get_the_content())
 * @param $return_size size of image to return
 * @return array
 */
function getGalleryImages($content, $return_size = 'large') {
  // Gallery is in format of [gallery link="..." ids="12,124,342"]
  preg_match('/ids="([^"]*)"/i', $content, $matches);

  $images = [];
  if (isset($matches[1])) {
    foreach(explode(',', $matches[1]) as $id) {
      // For each image in the gallery, get its WP data (url, width, height)
      $images[] = wp_get_attachment_image_src($id, $return_size);
    }
  }
  
  return $images;
}
```
