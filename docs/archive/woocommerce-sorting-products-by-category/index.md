---
layout: post
title: Sorting product by category in WooCommerce
permalink: woocommerce-sorting-products-by-category
date: '2013-10-05 15:56:26'
archive: true
category: wordpress,php
---

This past week I was assigned to heavily customize a Woocommerce install on a client's successful store. What needed to be done on one task, was to give the customers the ability to filter products on the product's page by a specific set of categories. In other words: Only show the products in _X Category_.

## Sure, this should be easy

Now, reading up on the Woocommerce documentation, I came across the filter named `woocommerce_get_catalog_ordering_args` which seemed like it would fit the bill and allow you to modify the post query, as shown in [this example snippit](http://docs.woothemes.com/document/custom-sorting-options-ascdesc/). My assumption being, `$args` was used similar to providing an array of args to `get_posts` or `WP_Query`. I was wrong - dead wrong. It turns out after all, `$args` passed to the `woocommerce_get_catalog_ordering_args` filter is more of a *collection of direct SQL commands which WordPress compiles*. This means simply passing `$args['product_cat'] = xxx;` wasn't going to work as I originally thought. Back to square one...

## Finding a clue to the puzzle

That's when I busted out some Google-Fu and tried to find *any* hook or filter Woocomerce had to directly modify the output of the query. There is no Woocommerce-direct way to do this from what I've found. I did however find a [WordPress support post](http://wordpress.org/support/topic/plugin-woocommerce-trying-to-order-categories#post-3186161) of people asking a similar question, and a guy by the name of `bheadrick` in that discussion provided some sample code.

> This works to sort products by category on the main shop page, but it also changes the order of my blog posts AND takes away the ability for any other sort of options, which is a bit of a bummer.

That is the sad key to the great code-snippet he provided in the discussion. Although it worked, it modified all of WordPress' post queries instead of just the Woocomerce product's page. I decided to dig into the Woocomerce code itself.

## Reading the code to find an answer

[In classes/class-Wc-Query.php on line 411](http://docs.woothemes.com/wc-apidocs/source-class-WC_Query.html#411), I found the function that called the `woocommerce_get_catalog_ordering_args` filter. Looking upwards from that line on `396`, is Woocomerce calling a filter `post_clauses`, bingo!

This is the filter I can use to add clauses (joins, wheres, orders) to the __$args__ passed. So mixing that, with the code `bheadrick` provided in the discussion is this...  

```php
add_filter('woocommerce_default_catalog_orderby_options', 'ty_catalog_orderby');
add_filter('woocommerce_catalog_orderby', 'ty_catalog_orderby');
function ty_catalog_orderby( $sortby ) {
  $sortby['originals'] = 'Originals';
  $sortby['prints']    = 'Prints';

  return $sortby;
}
 
add_filter('woocommerce_get_catalog_ordering_args', 'ty_get_catalog_ordering_args');
function ty_get_catalog_ordering_args($args) {
  global $wpdb;

  $orderby_value = isset($_GET['orderby']) ? woocommerce_clean($_GET['orderby']) : apply_filters('woocommerce_default_catalog_orderby', get_option('woocommerce_default_catalog_orderby'));

  if ('originals' == $orderby_value) {
    $args['orderby']  = 'date';
    $args['order']    = 'DESC';
    $args['meta_key'] = '';

    add_filter('posts_clauses', 'ty_post_clausesdd_originals');
  }

  if ('prints' == $orderby_value) {
    $args['orderby']  = 'date';
    $args['order']    = 'DESC';
    $args['meta_key'] = '';

    add_filter('posts_clauses', 'ty_post_clausesdd_prints');
  }

  return $args;
}
 
function ty_post_clausesdd_originals($args) {
  global $wpdb;

  $args['join']  .= " JOIN " . $wpdb->term_relationships ." tr ON " . $wpdb->posts . ".id = tr.object_id JOIN " . $wpdb->term_taxonomy ." tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'product_cat' JOIN " . $wpdb->terms ." t ON tt.term_id = t.term_id
JOIN " . $wpdb->woocommerce_termmeta ." tm ON tm.woocommerce_term_id = t.term_id and tm.meta_key = 'order'";
  $args['where'] .= " AND (t.term_id = 13)";

  return $args;
}
 
function ty_post_clausesdd_prints($args) {
  global $wpdb;

  $args['join']  .= " JOIN " . $wpdb->term_relationships ." tr ON " . $wpdb->posts . ".id = tr.object_id JOIN " . $wpdb->term_taxonomy ." tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy = 'product_cat' JOIN " . $wpdb->terms ." t ON tt.term_id = t.term_id
JOIN " . $wpdb->woocommerce_termmeta ." tm ON tm.woocommerce_term_id = t.term_id and tm.meta_key = 'order'";
  $args['where'] .= " AND (t.term_id = 16)";

  return $args;
}
```

- Lines `1-8` register the extra filters I want to show in Woocommerce's filter dropdown.
- Lines `10-33` adds my custom handler for when my filter is selected and called.
- Lines `35-43 and `45-53` is where the magic happens.

## In conclusion

Looking at the function `ty_get_catalog_ordering_args`, I check if my filter is being called, and if it is, I register a filter call for `post_clauses` on lines `21 and 29`. When the post_clauses are called, it will run one of my functions such as `ty_post_clausesdd_originals`. In this function, I add the join provided by *bheadrick* and add a *where clause* to tell it to find only posts with a category ID of `13`. Because this filter is being called inside __ty_get_catalog_ordering_args_ function, it will not affect standard WordPress post listings.

All you need to do if you wish to add this to your project is to change up the titling of the filter names and modify each category ID I provided. You can even do multiples by changing it to `$args['where'] .= " AND t.term_id IN(13, 15, 19)";` if you wish to get products in multiple categories for one filter action.

Anyways, that's my story on the hunt to add such a filter. Feel free to modify this and use it in your code since there doesn't seem to be a more viable option around that I've seen.
