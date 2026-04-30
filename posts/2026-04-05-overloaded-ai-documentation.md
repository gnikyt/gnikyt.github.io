---
layout: post
title: Overloaded AI documentation
permalink: overloaded-ai-documentation
date: '2026-04-05 18:30:01'
category: thoughts
---

## Problem created from a problem

For many years, the complaint in development (from developers, PMs, etc) was that documentation was non-existent or if it did exist, it was in an out-of-date state. When AI assistance started becoming more mainstream, suddenly, we seen the barrier of entry for writing general documentation, READMEs, and architectural overviews vanished. We moved from a "scarcity" problem to a "noise" problem overnight.

AI makes this easy. It can document every single line of code, and teams are doing exactly that. But this automation carries a hidden tax that many are only beginning to realize.

## Maintenance tax

When you document everything, you also commit to maintaining all of it. If an AI generates 25 Markdown pages of documentation for your app or backend, that documentation most likely now exists in a 1:1 relationship with the code.

Every time a database schema changes or a method is refactored, those pages must be audited and corrected. Even if the AI "updates" it for you, a human still has to verify that the documentation remains accurate. We've traded the effort of writing for the even more exhausting effort of a constant cycle of update and validate. We are effectively doubling our surface area for technical debt.

## DX of documentation

Documentation is a product, and the developer is the user.

If a developer opens a repository for an app or backend and is met with a 25+ page manual detailing every single database method and step-by-step job flow, they won't feel supported... they'll feel overwhelmed. Documentation should be a map, not a 1:1 scale replica of the landscape. **When everything is highlighted, nothing is important.**

## Lean documentation

To keep a project maintainable and readable, we need to move away from "comprehensive" documentation and toward "critical" documentation. The goal isn't to describe what the code does (the code itself should do that)... the goal is to explain the context that the code cannot.

What to keep in your documentation:

* The "Why": Capture the high-level architectural decisions that explain why the system is shaped the way it is. A short guide on something like the "Job Service Flow" is more valuable than a page-by-page walkthrough of every job involved in the app or backend.
* The Entry Points: Show developers how to get moving. Setup instructions, local environment configuration, the important scripts, and the few places they should start reading are all high-value because they reduce onboarding friction immediately.
* The Interfaces: Document the boundaries between systems and teams. API request/response structures, event payloads, contracts with third-party services, and shared error handling patterns are worth keeping because they are where confusion and breakage usually happen.
* The Brief "How-To": Keep short, punchy guides for the common tasks people repeat, such as running a job locally, replaying a webhook, seeding data, or debugging a failing workflow, how to queue work. These should help someone act quickly without turning into a miniature book.

## Summary

AI is a powerful tool for drafting documentation, but it cannot decide what deserves to be up-front-and-center. That judgment still belongs to the team.

Good documentation is selective. It explains why the system exists, how to enter it, where its boundaries are, and how to perform the tasks people actually repeat.

The best documentation doesn't prove that work was done. It helps the next person do theirs.
