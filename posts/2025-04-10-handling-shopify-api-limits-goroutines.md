---
layout: post
title: Handling Shopify API limits and Goroutines
permalink: handling-shopify-api-limits-goroutines
date: '2025-04-10 16:26:22'
---

I frequently build integration applications with Shopify, and I thought it would be helpful to highlight one approach (of many) for handling rate limits with Shopify’s GraphQL API using Go that I often use (depending on the project). In this case, the integration was originally handled by a third-party provider. However, after they were acquired, they shut down their service and the integration needed to be rebuilt from scratch.

The original integration accepted a standardized CSV file from a third-party service. This file contained a list of SKUs and their inventory levels, which needed to be synced with the Shopify store. The same CSV format was used by the service for multiple merchants and typically contained between 3,000–3,500 rows. Not every SKU in the CSV necessarily existed in the store, so that had to be accounted for during processing.

The new application had to handle the following steps:

1. Read each line from the CSV
2. Check if the SKU exists in the store
3. If it does, update its inventory to the specified value

Format of the CSV:

```csv
ITEM_CODE,QTY
00288,5
22991,1
23211,18
...
```

Shopify's GraphQL API limits would obviously be high priority to factor in. In the case for this specific Shopify store, the limits were:

* 2000 available points
* 100 points refilled per second

Each row in the CSV required one to two GraphQL calls to Shopify, depending on whether the SKU existed in the store. A query was needed to fetch the SKU, and if it was found, a mutation followed which would update the inventory. By analyzing the query and mutation costs in Shopify’s GraphQL app, it was determined that each query consumed 2 points, while each mutation consumed 10 points. This meant, in the worst case senario, where every SKU existed, a total of 12 points would be consumed per row.

My goal was to maximize the number of concurrent queries and mutations without blowing through the available points too quickly. At the same time, maintain a safeguard to throttle requests if the point threshold was reached, allowing time for points to refill and ensuring the updates could continue without having a bad request returned by Shopify.

With the point consumption determined, I developed a script to simulate depleating the available points by 12, multiplied by the potential concurrent running updates, while also increasing the available points at a rate of 100 points per second. This simulation also counted the number of requests per second. The result of this testing with a different number of potential concurrent running jobs, I came to the conclusion that between 15-20 concurrent jobs would be a safe balance; potientially draining 180 points per second or more and refilling at a rate of 100 per second, would result in an average net decrease of 80 points per second from the available points. Given a safeguard would be in place to handle potentially hitting the threshold of available points, this was a great balance to continue with.

Now, there are several methods a developer can take to craft a solution preventing draining the available points down to zero... some may simply call each job in sequence or a batch of jobs in sequence and sleep for a set time afterwards, some may develop a worker pool system with a small set capacity, etc.

I decided to develop a semaphore approach. If you're not familiar, a semaphore is essentially a concurrency control method to maintain a set capacity of "how many" of something is permitted to run at a time. A process would "aquire" a spot and when completed it's work, it would "release" the spot, so another process can aquire it.

Since there was only between 3,000-3,500 rows in the CSV on average, I decided to skip a worker pool setup and simply spin up each row of the CSV as a Goroutine, where each Goroutine would attempt to aquire a spot with the semaphore control and upon release of that spot, we would check the remaining available points and handle accordingly. 

Additionally, the capacity of this semaphore would be set to the 15-20 limit previously determined from the simulated script. If the remaining available points dipped below a set threshold, the release mechanism would cause a "pause" in releasing, calculating the time it would take to refill the available points back to maximum, then resuming the release. This would allow 15-20 concurrent jobs to be running at a time, while the release mechanism acted as the safe guard to ensure the available points were not totally drained.

Example code is below.

```go
// regulator/point.go
package regulator

import (
	"sync/atomic"
	"time"
)

// Point represents the information of point values and keeps
// track of the remaining points, threshold, limit, and refill rate.
type Point struct {
	Remaining  atomic.Int32 // Points remaining.
	Threshold  int32        // Point value to which we would begin sleeping.
	Limit      int32        // Upper limit of points available.
	RefillRate int32        // Rate of refill of number of points per second.
}

// Update accepts a new value of remaining points to store.
func (pts *Point) Update(points int32) {
	pts.Remaining.Store(points)
}

// RefillDuration accounts for the remaining points, the limit, and the refill rate to
// determine how many seconds it would take to refill to remaining points back to full.
// It will return a duration which can be used to sleep.
func (pts *Point) RefillDuration() time.Duration {
	return time.Duration((tp.Limit-tp.Remaining.Load())/tp.RefillRate) * time.Second
}

// AtThreshold will return true or false if we have reached or surpassed the set
// threshold of remaining points or not.
func (pts *Point) AtThreshold() bool {
	return tp.Remaining.Load() <= tp.Threshold
}
```

```go
// regulator/regulator.go
package regulator

import (
	"sync"
	"time"
)

// Regulator is responsible regulating when to pause and resume processing of Goroutines.
// Points remaining, point thresholds, and point refill rates are taken into
// consideration. If remaining points go below the threshold, a pause is initiated
// which will also calculate how long a pause should happen based on the refill rate.
// Once pause is completed, the processing will resume. A PauceFunc and ResumeFunc
// can optionally be passed in which will fire respectively when a pause happens
// and when a resume happens.
type Regulator struct {
	*Point // Point information and tracking.

	PauseFunc  func(int32, time.Duration) // Optional callback for when pause happens.
	ResumeFunc func()                     // Optional callback for when resume happens.

	pausedAt time.Time     // When paused last happened.
	sema     chan struct{} // Semaphore for controlling the number of Goroutines running.

	mu     sync.Mutex // For handling paused flag control.
	paused bool       // Pause flag.
}

// NewRegulator returns a pointer to a Regulator. It accepts a cap which represents the
// capacity of how many Goroutines can run at a time, it also accepts information
// about the point parameters and lastly, optional paramters.
func New(cap int, point *Point, opts ...func(*Regulator)) *Regulator {
	reg := &Regulator{
		Point: point,
		sema:  make(chan struct{}, cap),
	}
	for _, opt := range opts {
		opt(reg)
	}
	if reg.PauseFunc == nil {
		// Provide default PauseFunc.
		withPauseFunc(func(_ int32, _ time.Duration) {})(reg)
	}
	if reg.ResumeFunc == nil {
		// Provide default ResumeFunc.
		withResumeFunc(func() {})(reg)
	}
	// Set the remaining points to the limit of points.
	reg.Update(point.Limit)
	return reg
}

// Aquire will attempt to aquire a spot to run the Goroutine.
// It will continue in a loop until it does aquire also pausing
// if the pause flag has been enabled. Aquiring is throttled at
// the value for AquireBuffer.
func (reg *Regulator) Aquire() {
	var aquired bool
	for !aquired {
		// Factor in pause flag. Looping will cause a "pause".
		for {
			if !reg.paused {
				break
			}
		}

		// Attempt to aquire a spot, if not we will throttle the next loop.
		select {
		case reg.sema <- struct{}{}:
			aquired = true
		default:
			time.Sleep(AquireBuffer)
		}
	}
}

// Release will release a spot for another Goroutine to take.
// It accepts a current value of remaining points, to which the
// remaining points will only be updated if the count is greater than -1.
// If the remaining points is below the set threshold, a pause will be
// initiated and a duration of this pause will be calculated based
// upon several factors surrouding the point information such as limit,
// threshold, and the refull rate.
func (reg *Regulator) Release(points int32) {
	defer reg.mu.Unlock()
	reg.mu.Lock()

	reg.Update(points)
	if reg.AtThreshold() {
		// Calculate the duration required to refill and that duration time has passed
		// before we call for a pause.
		ra := reg.RefillDuration() + PauseBuffer
		if reg.pausedAt.Add(ra).Before(time.Now()) {
			reg.paused = true
			reg.pausedAt = time.Now()
			reg.PauseFunc(points, ra)

			go func() {
				time.Sleep(ra)
				reg.paused = false
				reg.ResumeFunc()
			}()
		}
	}

	<-reg.sema
}

// withPauseFunc is a functional option for the Regulator to
// call when a pause happens. The points remaining and the
// duration of the pause will passed into the function.
func withPauseFunc(fn func(int32, time.Duration)) func(*Regulator) {
	return func(reg *Regulator) {
		reg.PauseFunc = fn
	}
}

// withResumeunc is a functional option for the Regulator to
// call when resume from a pause happens.
func withResumeFunc(fn func()) func(*Regulator) {
	return func(reg *Regulator) {
		reg.ResumeFunc = fn
	}
}
```

```go
package processor

const (
	Retries    int           = 3               // Number of times to retry a failed row processing.
	RetryDelay time.Duration = 1 * time.Second // Delay for between the retries.

	Capacity int = 15 // Number of Goroutines to be able to run at once.

	PointThreshold  int32 = 200  // The threshold of when we should pause.
	PointLimit      int32 = 2000 // Maximum number of points available.
	PointRefillRate int32 = 100  // Refill rate of points per second.
)

//
// ...
//

p.Regulator := regulator.New(
	Capacity,
	regulator.Point{
		Threshold: PointThreshold,
		Limit: PointLimit,
		RefillRate: PointRefillRate,
	},
)

//
// ...
//

func (proc *processor) runJob(row []string) {
	proc.regulator.Aquire()
	points, err := retry(proc.processJob(row))
	proc.postProcessJob(row, err)
	proc.regulator.Release(points)
}

//
// ...
//

func (proc *processor) Run() {
	proc.timeStart = time.Now()

	read, closer, err := proc.newReader()
	defer closer()
	if err != nil {
		log.Printf("[error] run: read: %s\n", err)
		proc.ctxCancel()
		return
	}

	// Skip the header row.
	_, err = read()
	if err != nil {
		log.Printf("[error] run: row: %s\n", err)
		proc.ctxCancel()
		return
	}

	// Read rest of rows outside of the header.
	for loop := true; loop; {
		row, err := read()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			proc.ctxCancel()
			log.Fatalf("[error] run: row: %s\n", err)
		}

		select {
		case <-proc.ctx.Done():
			// Context closed, stop processing rows.
			log.Println("[info] run: ctx exited due to abort or timeout")
			loop = false
		default:
			// Run the job.
			proc.jwg.Add(1)
			go proc.runJob(row)
		}
	}

	go func() {
		proc.jwg.Wait()
		close(proc.done)
	}()
	<-proc.done

	proc.timeEnd = time.Now()
	if err = proc.SendSummary(); err != nil {
		log.Printf("[error] run: %s\n", err)
	}
}

//
// ...
//
```

Using our above semaphore method, we are allowing 15 Goroutines to run concurrently out of the 3,000-3,500 Goroutines, where each upon each Goroutine's completion, the Goroutine will report the remaining points back to the release mechanism, which will determine if a pause is needed before actually issuing the release.

The result was a success for this project... the inventory updates we're able to complete between 3 1/2 to 4 1/2 minutes without hitting the threshold often. Hopefully this helpful to those looking to do similar.
