---
layout: post
title: 'Vuex & Data: Keeping it clean'
permalink: vuex-data-keeping-it-clean
date: '2019-07-19 16:44:52'
---

## Introduction

Vuex is a state management library, centralized storage of data for your whole application. It's well documented, beautiful, and easy to use with Vue. The part I want to talk about today is the **data** portion.

I have increasingly seen cases where the **data** state of Vuex gets transformed and represents something more than just plain-old **data** ; that's a problem in the long run.

## The Problem

A simple example...

### Step 1

An external API request is sent out through an **action** to get a list of books.

### Step 2

That book data is then sent to the **mutation** handler where the developer would map the data to a model class: `const bookCollection = books.map(book => new Book(book));`.

### Step 3

This transformed data gets **committed** to the state afterwards with `state.books = bookCollection;`.

### All-Together

At first, this seems convenient to the developer, because in any part of their code, they can utilize their models such as: `const authorsNotOnSale = state.books.filter(book => !book.isOnSale()).map(book => book.getAuthor())`.

But, what happens when you want to serialize that data to JSON? Store it somewhere else outside of Vuex? Such as using a library like `vuex-persist`?

You'll immediately loose all those nice model functions you've built out and you can not easily restore the state because its more than just **data** at this point.

## The Solution

The proper solution would be to utilize Vuex **getters** to transform that **data** into something more usable in your application.

`const bookCollection = state => state.books.map(book => new Book(book));`

Keep the **data** clean, lean, and plain. Think of the **data** this way: _can I serialize this?_ If the answer is _no_, you may need to dig into _why_.
