---
layout: post
title: New cq release
permalink: new-cq-release
date: '2026-02-11 07:48:02'
category: golang
---

I intended to write an update about `cq` since a lot of features have been added in recent months, but I realized this is actually the first time I've posted about `cq`!

Given that, here is an overview of the project.

## What is cq?

`cq` (Composable Queue) is an auto-scaling Go queue for processing functions as jobs.

At the core, it gives you:

* A worker pool that scales between min/max workers
* A queue for job execution (including priority support)
* Wrappers you can compose around jobs for behavior like retries, backoff, timeouts, tracing, release/defer, and circuit breaking

The key design idea is composition: keep job logic focused on business work, and layer operational behavior around it with wrappers.

## Why use it?

For most teams, background processing eventually needs more than "run this function later":

* Handling transient failures cleanly
* Controlling retries and backoff without spaghetti logic
* Preventing overlap or duplicate work
* Respecting upstream rate limits
* Capturing outcomes and tracing for observability

`cq` is aimed at those real-world concerns while staying lightweight, dependency-free, customizable, and fast; a great drop-in package to both new and existing setups.

## Where cq fits

You can use it in a few ways:

1. **Standalone (in-memory)**  
   Great for CLIs, internal services, and apps where external queue infra is unnecessary.

2. **With external brokers**  
   Use SQS/Redis/RabbitMQ/etc for transport and use `cq` as your in-process worker execution layer.

3. **Embedded in an existing app**  
   Add background job processing without introducing a full queue platform.

## Core benefits

* Auto-scaling workers (min/max)
* Composable wrappers for retries, timeout, backoff, tracing, outcomes, and more
* Priority dispatch for time-sensitive jobs
* Built-in scheduler for recurring and one-time work
* Job metadata in context (ID, enqueue time, retry attempt)
* Circuit breaker, overlap controls, and uniqueness constraints
* No external dependencies required for core usage

---

## What's new

A lot has changed recently for `cq`, mostly focused on making real-world job handling easier (retries, rate limiting, observability, and safer control over failure behavior).

## Big mentions

* Scheduler support (**Every**, **At**, with easy cron-like adaptation)
* Conditional retries (**WithRetryIf**)
* Tracing wrapper (**WithTracing**)
* Rate limiting (**WithRateLimit**)
* Job metadata in context (**MetaFromContext**)
* Circuit breaker wrapper (**WithCircuitBreaker**)
* Outcome-based errors (**AsRetryable**, **AsPermanent**, **AsDiscard**)
* **WithOutcome** callback wrapper (complete/fail/discard hooks)
* **WithReleaseSelf** + **RequestRelease** (job-driven deferred re-enqueue)
* **WithRateLimitRelease** (defer instead of blocking workers when rate-limited)

## In-depth

### Outcome markers make retries clearer

Instead of "everything is just an error"... you can mark intent directly now:

* **cq.AsRetryable(err)**
* **cq.AsPermanent(err)**
* **cq.AsDiscard(err)**

```go
job := cq.WithRetryIf(func(ctx context.Context) error {
	err := process(ctx)
	if err == nil {
		return nil
	}

	if isValidationError(err) {
		return cq.AsPermanent(err) // Don't retry this.
	}
	if isTransient(err) {
		return cq.AsRetryable(err) // Retry this.
	}
	return cq.AsDiscard(err) // Intentionally ignore.
}, 5, func(err error) bool {
	return errors.Is(err, cq.ErrRetryable)
})
```

Why this helps: retry behavior is explicit and easier to reason about at a glance. This will retry up to 5 times unless the error returned is stated as not retryable.

## WithOutcome for success/fail/discard handling

```go
job := cq.WithOutcome(
	actualJob,
	func() { log.Println("completed") },
	func(err error) { log.Printf("failed: %v", err) },
	func(err error) { log.Printf("discarded: %v", err) },
)
```

All callbacks are optional (`nil` if you don't care about one of them).

Nice for: logging, metrics, DLQ routing, idempotency/no-op visibility.

This also replaces the existing **WithResultHandler**, which is still usable, but deprecated.

## WithReleaseSelf lets jobs defer themselves

Before this, we only had **WithRelease**, which was a wrapper-level, predicate-driven release with a fixed delay configured outside the job.

That is still useful, but it is different:

* **WithRelease** decides from the outside ("if this error matches, release for X duration")
* **WithReleaseSelf** lets the job decide from the inside ("release me now"), without requiring an error path

This matters when delay is dynamic and only knowable during execution (for example, reading a `Retry-After` header, per-tenant pacing, or upstream/external conditions).

```go
job := cq.WithReleaseSelf(func(ctx context.Context) error {
	cq.RequestRelease(ctx, 30*time.Second) // Initial estimate.
	if shouldRetrySoonerForSomeReason() {
		cq.RequestRelease(ctx, 5*time.Second) // Last call wins.
	}
	return nil
}, queue, 3) // maxReleases (0 = unlimited).
```

A couple useful notes:

* If both error and release request happen, release wins while budget allows.
* Multiple **RequestRelease** calls in one run: last call wins.
* **RequestRelease** returns `false` if not running under **WithReleaseSelf**.

Good fit for: dynamic "try again later" behavior (retry-after, upstream warmup, tenant pacing).

## WithRateLimitRelease avoids worker blocking

* **WithRateLimit**: blocks waiting for a token.  
* **WithRateLimitRelease**: re-enqueues using limiter delay so workers are freed immediately.

```go
limiter := rate.NewLimiter(10, 5)
job := cq.WithRateLimitRelease(actualJob, limiter, queue, 3)
queue.Enqueue(job)
```

Use this when throughput matters and you don't want workers parked waiting on limiter tokens. The release of the job back into the queue is delayed and automatically delayed by a duration determined directly by the rate limiter API.

## Overlap lock duration is already composable

Not a code change to the package, but a call-out. If you need overlap protection but don't want lock hold to run forever:

```go
job := cq.WithoutOverlap(
	cq.WithTimeout(actualJob, 5*time.Minute),
	"account-123",
	locker,
)
```

## Scheduler (`Every`, `At`)

Recurring and one-time job scheduling is now built in, and you can adapt cron-like workflows on top of it easily.

```go
queue := cq.NewQueue(2, 10, 100)
queue.Start()

scheduler := cq.NewScheduler(context.Background(), queue)
defer scheduler.Stop()

scheduler.Every("cleanup", 10*time.Minute, cleanupJob)
scheduler.At("reminder", time.Now().Add(1*time.Hour), reminderJob)
```

For cron-like behavior, you can layer an external parser and re-schedule after each run:

```go
func ScheduleCron(s *cq.Scheduler, id, expr string, job cq.Job) error {
	gron := gronx.New()
	if !gron.IsValid(expr) {
		return fmt.Errorf("ScheduleCron: invalid cron: %s", expr)
	}

	nextRun, _ := gronx.NextTick(expr, true)

	var scheduled cq.Job
	scheduled = func(ctx context.Context) error {
		err := job(ctx)
		if next, e := gronx.NextTick(expr, false); e == nil {
			s.At(id, next, scheduled)
		}
		return err
	}

	return s.At(id, nextRun, scheduled)
}

ScheduleCron(scheduler, "daily", "0 2 * * *", dailyJob)
```

## Tracing hooks

Tracing hooks give you consistent timing/error visibility for job execution. You can build support in for services like Sentry, DataDog, etc.

```go
type myHook struct{}

func (h myHook) Start(ctx context.Context, name string) context.Context { return ctx }
func (h myHook) Success(ctx context.Context, d time.Duration) {}
func (h myHook) Failure(ctx context.Context, err error, d time.Duration) {}

job := cq.WithTracing(actualJob, "sync-products", myHook{})
queue.Enqueue(job)
```

## Circuit breaker

Circuit breaker support helps protect downstream systems during repeated failure periods by moving through three states:

* **Closed**: Normal flow, jobs execute. After enough consecutive failures, the circuit opens.
* **Open**: Calls are rejected immediately (**cq.ErrCircuitOpen**) during cooldown.
* **Half-open**: After cooldown, one or a small probe path is allowed to test recovery. Success closes the circuit again; failure re-opens it.

```go
paymentCB := cq.NewCircuitBreaker(5, 30*time.Second)

job := cq.WithCircuitBreaker(func(ctx context.Context) error {
	return processPayment(orderID)
}, paymentCB)
queue.Enqueue(job)
```

## Job metadata in context

Job metadata (ID, enqueue time, attempt) is available in context for logging and execution-aware logic.

```go
job := func(ctx context.Context) error {
	meta := cq.MetaFromContext(ctx)
	log.Printf(
		"job %s, attempt %d, queued %v ago",
		meta.ID, meta.Attempt, time.Since(meta.EnqueuedAt),
	)
	return doWork(ctx)
}
queue.Enqueue(job)
```

---

Testing and benchmarks from the README:

```bash
make test
ok      github.com/gnikyt/cq    17.586s coverage: 91.2% of statements
```

```bash
make bench
cpu: Apple M5
BenchmarkScenarios/100Req--10kJobs-10                             7    192443179 ns/op
BenchmarkScenarios/1kReq--1kJobs-10                               7    194722393 ns/op
BenchmarkScenarios/10kReq--100Jobs-10                             7    352322048 ns/op
BenchmarkSingleSteadyState-10                               3063700        393.4 ns/op
```

GitHub: [github.com/gnikyt/cq](https://github.com/gnikyt/cq)
