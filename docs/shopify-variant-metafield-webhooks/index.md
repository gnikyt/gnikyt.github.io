---
layout: post
title: Shopify variant metafield webhooks
permalink: shopify-variant-metafield-webhooks
date: '2025-08-08 16:00:00'
category: shopify
---

When you update a metafield for a customer in Shopify, the Customer Update Webhook is triggered. Similarly, updating a product metafield fires the Product Update Webhook. However, updating a metafield on a product variant does **not** trigger the Variant Update Webhook.

Recently, I needed to be notified about variant metafield updates to sync them with an internal system. Since the webhook doesn't fire for these changes, the only alternative would be to inefficiently poll the variants for updates. Fortunately, I found a workaround based on information from Shopify.dev.

**Metaobjects** as the storage for the variant metafields. Althrough seemingly rough on the surface, it did actually work for our needs. What I did was create a "Variant" metaobject, added a field called "Variant ID" which was a string and set to be the display code. This means that the variant ID would become the handle of the metaobject entry. Other fields required, which normally would've lived in the variant metafield level, were then added to this new metaobject.

All existing variant metafields were deleted and a single metafield on the variant level was added called "Meta", which was a metafield that links to a singular metaobject. By configuring it this way, clicking on "Meta" inside a variant would allow for adding information to the new metaobject, or updating the existing metaobject for that variant.

Metaobjects **do** support webhook notifications for create, update, and delete, it even allows filtering for only the webhooks you require. For this, I filtered by the new "Variant" metaobject, to only recieve notifications for those.

![](/assets/images/posts/variant_metaobject.gif)

Hopefully Shopify will allow the Variant Update Webhook to fire in the future when a metafield changes, but for now, this workaround solved the issue.
