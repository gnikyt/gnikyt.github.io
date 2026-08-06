---
layout: post
title: Developer supports are important
permalink: developer-supports-are-important
date: '2026-08-05 08:31:20'
category: thoughts
---

A webhook that can fire twice. A job that needs to back off and retry instead of hammering an endpoint after a timeout. An API that rate-limits mid-batch. Two workers racing to touch the same record because nothing prevented overlap. A payload that shows up late or malformed. Expensive routes being hammered with no cache. Auth that was improperly implemented. None of that is exotic, and honestly, none of it is really the point.

The actual problem is that a lot of agencies don't give developers anything to reach for when these things come up. So every developer, on every project, ends up rebuilding payload handling, idempotency checks, auth handling, caching, retries and backoff, and rate limiting from scratch... instead of spending that time on the business logic they were actually brought on to write and solution for.

Multiply that across every client, every ticket, every developer who wasn't around for the last time someone solved the same problem, and the result is a pile of one-off infrastructure that all does roughly the same thing slightly differently, none of it documented, none of it shared. That's the actual case for developer supports: internal tools and frameworks that already handle the repeatable infrastructure work, so developers can focus on the code and business logic that's actually specific to the client, instead of re-crafting the plumbing underneath it every single time, and probably doing it incorrectly as well.

## Feature trap

It's easy to end up here. Features are what go in the pitch deck. They're visible, they demo well, clients can see them and get excited about them. Standardizing what you offer... the flows, the UX, the capabilities... feels like real progress, and don't get me wrong, it is real progress. So teams keep shipping features, and the plumbing underneath quietly falls behind. Nobody budgets time for it because there's always a feature to build first, and the plumbing "already works, mostly," until it doesn't, or, the developer is told to create that plumbing when they pick the ticket up, or worse, its not even mentioned and the developer doesn't think to handle it.

This is fine for a while. Small clients don't ask hard questions. A junior dev can muddle through by pinging whoever built the last version of the same fix. Nobody notices the gap internally... until the business starts landing bigger, more technical clients.

## Where it actually breaks

Enterprise clients change the math. They have their own technical people. They ask exactly the questions your undocumented, one-off infrastructure can't answer well: how do you handle retries, what happens on a duplicate webhook, how do you rate-limit against our API, what's your test coverage look like, how are you tracking requests in and ensuring its completed, how are we handling races, X condition, Y condition, and so on. They are well versed and expect infrastructure and core architecture to exist and when the honest answer is "depends which developer built it, and there's no doc for it," that's not a small embarrassment at all... that's a credibility problem, live, on a call, with the client deciding whether to keep going or not.

I've sat on those calls. More than once in my career. It's not fun, and it's avoidable. For many years I've consulted teams on exactly how to avoid this by starting with an internal discovery.

The cost shows up in a few predictable ways:

* The same integration problem gets re-solved from scratch by a different developer every time it comes up, because nothing from the first time was kept or vetted.
* One person becomes the only one who actually understands how something critical works, which means the whole thing is one vacation or one bad week away from a real problem. Docs anyone?
* Technical clients notice the missing supports faster than anyone internally does, because the big clients are in the weeds of the project.
* Every project that skips a base infrastructure makes the next project's shortcut look a little more reasonable too, and it compounds.

None of this is really a people problem. It's what happens by default when growth outpaces investment in the unglamorous stuff, and nobody carves out the time to fix it because there's always something more visible to ship first. It takes dedicated time from knowledgable internal people with stakes in the game to resolve.

## What developer supports actually looks like

Not an abstract "engineering culture" thing. Concretely, this is everything a developer should be able to reach for without having to build it themselves, again, on every project:

**Getting up and running**

* **A local environment that just works** — clone it, run one command, Docker etc, you're up. Not three hours chasing missing env vars and undocumented service dependencies before you can even start. Maybe even a master scaffold command.
* **Testing that's actually usable** — fixtures, mocks, and a harness that makes writing a test the path of least resistance, not something that quietly gets skipped because it's harder than shipping without one.
* **CI that catches problems before a human has to** — linting, formatting, and tests running automatically on every push, not "please remember to run this locally before you push."
* **Ergonomics** — linting/formatting config checked into the repo and enforced.

**Shared code you don't rewrite per project**

* **Versioned, shared modules/packages** — fix it once, roll the fix out everywhere with a version bump, instead of copy-pasting a patch into five repos and hoping you remembered all five.
* **Shared error type system** — typed/sentinel errors (retryable vs permanent vs validation) instead of every function returning a bare error or exception with no way to programmatically distinguish failure kinds.
* **API client generation** — instead of hand-writing HTTP calls and hoping the shape matches.
* **Common HTTP client wrappers** — auth headers, timeouts, retries, and logging already wired in, instead of it being configured differently per project needlessly.
* **Standardized middleware** — auth, request logging, rate limiting, CORS, not copy-pasted per service.
* **Validation library/convention** — extendable, solid... not five different regex-based checks across five repos.

**Knowing what's happening**

* **Idempotency, retries, backoff, and rate limiting handled once, centrally** — not reinvented per client because a webhook fired twice again.
* **Logging and error handling that actually tell you something** — not a bare stack trace three services removed from where the real problem happened. Get some observability and tracing in place.
* **Documentation that's actually current** — not a Slack canvas from two years ago nobody trusts anymore.

**Job and queue handling**

* **Dead-letter handling that's automatic** — jobs that exhaust retries land somewhere visible and inspectable, not silently vanish because nobody wired up a DLQ.
* **Recovery, not just failure** — a way to replay or requeue dead jobs after a fix ships, instead of manually re-triggering whatever broke.
* **Priority dispatch** — time-sensitive jobs don't sit behind a backlog of low-priority ones because everything's in one flat queue.
* **Outcome tracking baked in** — complete, fail, and discard are distinct, trackable states, not just "it either worked or it threw."
* **Overlap and uniqueness protection** — a job tied to a given resource (an account, an order) can't run twice concurrently just because two triggers fired close together.
* **Circuit breaking on flaky dependencies** — repeated failures against a downstream system trip a breaker instead of every worker hammering it in lockstep.
* **Scheduling that's a first-class feature** — recurring and one-time jobs don't need a separate cron system bolted on the side.

...and it keeps going. **Whatever problem you've watched developers solve over and over** belongs on this list too.

Done right, this pays for itself fast. Developers stop rebuilding the same plumbing every ticket and get to spend their time on the part of the work that's actually specific to the client. Bugs get fixed once instead of N times across N slightly-different copies. And the team stops being one person's memory away from a real outage. This list above is just examples, it can be anything at the end of the day - if you're repeating the same plumbing many ways to Sunday on every project, take notice, and fix it; start somewhere.

## They're not actually competing

"Features vs. infrastructure" is a little bit of a false framing, honestly. Infrastructure is what makes sustainable feature delivery possible in the first place. A team with solid developer supports ships features faster over time, not slower, because they're not paying a growing tax of undocumented one-offs on every single project. Skipping the infra work isn't really choosing features over infrastructure... it's borrowing against next year's velocity to make this quarter's roadmap look better than it is.

If your client base is getting bigger and more technical, they will eventually ask the infrastructure questions. The only real choice is whether you're ready when they do.

Standardized features are worth having. They're just not worth having at the expense of the boring stuff underneath them. Build that first, or you'll end up rebuilding it later, **under worse conditions, with a client watching**.
