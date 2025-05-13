---
layout: post
title: Async Shopify API for Python
permalink: async-shopify-api-for-python
date: '2020-06-29 12:31:02'
archive: false
category: shopify,python
---

## Introduction

I maintain a fairly used [PHP](https://github.com/gnikyt/Basic-Shopify-API) library for Shopify API which uses Guzzle for sync/async requests. It was also recently featured as a recommended third-party library on Shopify's dev docs.

For Python, which I also use with Shopify work, I didn't notice a library which provides async abilities. Normally I use Shopify's Python library which provides a nice ActiveResource implementation. However, their library has no plans to support async.

I decided to create a tested library that can do both, [basic_shopify_api](https://github.com/gnikyt/basic_shopify_api). It is a loose port of my PHP version which supports sync, async, HMAC validation, rate limiting, automatic retries, REST, and GraphQL; all backed by the HTTPX package.

You simply need to set up some basic options and create a session for a shop to get started.

## Sync

### REST

```python
from basic_shopify_api import Client

# ...

with Client(sess, opts) as client:
    shop = client.rest("get", "/admin/api/shop.json", {"fields": "name,email"})
    print(shop.response)
    print(shop.body["name"])

    # returns the following:
    # RestResult(
    #   response=The HTTPX response object,
    #   body=A dict of JSON response, or None if errors,
    #   errors=A dict of error response (if possible), or None for no errors, or the exception error,
    #   status=The HTTP status code,
    #   link=A RestLink object of next/previous pagination info,
    #   retries=Number of retires for the request
    # )
```

### GraphQL

```python
from basic_shopify_api import Client

# ...

with Client(sess, opts) as client:
    shop = client.graphql("{ shop { name } }")
    print(shop.response)
    print(shop.body["data"]["shop"]["name"])

    # returns the following:
    # ApiResult(
    #   response=The HTTPX response object,
    #   body=A dict of JSON response, or None if errors,
    #   errors=A dict of error response (if possible), or None for no errors, or the exception error,
    #   status=The HTTP status code,
    #   retries=Number of retires for the request,
    # )
```

## Async

### REST

```python
from basic_shopify_api import AsyncClient

# ...

async with AsyncClient(sess, opts) as client:
    shop = await client.rest("get", "/admin/api/shop.json", {"fields": "name,email"})
    print(shop.response)
    print(shop.body["name"])

    # returns the following:
    # RestResult(
    #   response=The HTTPX response object,
    #   body=A dict of JSON response, or None if errors,
    #   errors=A dict of error response (if possible), or None for no errors, or the exception error,
    #   status=The HTTP status code,
    #   link=A RestLink object of next/previous pagination info,
    #   retries=Number of retires for the request
    # )
```

### GraphQL

```python
from basic_shopify_api import AsyncClient

# ...

async with AsyncClient(sess, opts) as client:
    shop = await client.graphql("{ shop { name } }")
    print(shop.response)
    print(shop.body["data"]["shop"]["name"])

    # returns the following:
    # ApiResult(
    #   response=The HTTPX response object,
    #   body=A dict of JSON response, or None if errors,
    #   errors=A dict of error response (if possible), or None for no errors, or the exception error,
    #   status=The HTTP status code,
    #   retries=Number of retires for the request,
    # )
```

## Conclusion

The above examples are brief, refer to the README of the project for full information. But I believe you will find it very helpful - especially the automatic retries for failed requests and built-in rate/cost limiting.

Feel free to give it a try with your projects, with the continual rise of async within Python, I hope the library will serve some use to you. I've recently paired it with [FastAPI](https://fastapi.tiangolo.com/) and it performed well.
