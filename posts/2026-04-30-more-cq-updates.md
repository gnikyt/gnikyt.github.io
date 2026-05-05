---
layout: post
title: cq release updates
permalink: more-cq-updates
date: '2026-04-30 13:29:02'
category: golang
---

Back in February I wrote about the latest [cq](https://github.com/gnikyt/cq) release. Since then, I have kept pushing on the project and it has picked up a nice set of workflow improvements.

The biggest additions have been around composing larger job flows more cleanly:

* `WithDependsOn` for dependency-aware job execution
* `WithCheckpoint` for retry-safe workflow step tracking/checkpointing
* `WithConcurrencyByKey` for limiting concurrent work per key
* Queue manager and priority queue manager support for routing jobs across multiple queues

There has also been a lot of refinement around contention and dispatch behavior. Jobs that run into uniqueness, overlap, or keyed concurrency pressure now have better control over what happens next, including clearer contention handling and optional release behavior for `WithUnique`.

Also, implemented batch reporting support with a custom store option and an in-memory default. That makes grouped execution easier to observe without having to bolt on your own reporting layer.

The docs have grown quite a bit too, especially around custom lockers, checkpoint stores, and keyed concurrency limiters, which should make it easier to use `cq` in more distributed setups without losing the simple in-memory starting point.

Current release at the time of writing: `v1.29.0`.
