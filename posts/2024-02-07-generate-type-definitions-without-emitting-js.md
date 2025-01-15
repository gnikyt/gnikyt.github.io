---
layout: post
title: Generate type definitions without emitting Javascript
permalink: generate-type-definitions-without-emitting-js
date: '2024-02-07 13:44:12'
---

## Introduction

A Shopify-based project was assigned which was a backend app with frontend extensions. After completion of the backend, it was realized that the frontend extensions needed types from the backend.

Extensions with Shopify's setup does not allow importing relative packages. For example, if this was the loose structure:

     - app/
         - paginate/
             index.ts
             index.test.ts
         - value/
             amount.ts
             amount.test.ts
             id.ts
             id.test.ts
         - [etc]  
     - extensions/
         - order-stats/
             - src/
                BlockExtension.tsx
             - [etc]
     - [etc]

We would not be able to do something such as:

```typescript
// extensions/order-stats/src/BlockExtension.tsx

import { type PaginatedRecords } from "../../../app/paginate";
import { type ShopifyOrderIdValue } from "../../../app/value/id";
```

This would produce an error and not compile. You could copy/paste the type definitions into the extension manually, but this is not a great idea.. what if the types you're importing change? They would be out of sync if you did not manually correct it.

A solution is to generate types based upon the app into a local package which the extensions can use.

## types package

Create a directory at the root called `types`, then `cd` inside and run `npm init`. Once done, you should have a `package.json` inside similar to this:

```json
{
  "name": "app-types",
  "private": true,
  "version": "1.0.0"
}
```

In my case, I named the package `app-types`, but you're free to name as you please.

## Generation

Create a `bin/app-typegen` with the following contents:

```bash
#!/usr/bin/env bash

# List the files you would like to generate types for
srcs=("paginate/index" "value/id", "value/amount")
for src in "${srcs[@]}"; do
  # Generation to the types/ directory
  tsc -d "app/$src.ts" --declarationDir types
  # Remove Typescript-generated .js files
  for file in $(git status -s); do
    if [[ $file == *"app/"* ]] && [[ $file == *".js"* ]]; then
      rm "$file"
    fi
  done
done
```

What this script does is allow you to list out the files you would like to generate types for. It will then utilize `tsc` to generate the types and dump the `d.ts` files into the `types` directory we previously created. Next, it will check the status of `git` to remove the generated Javascript files as there appears to be no way to not emit Javascript files during generation.

Additionally, you can add a slot into your root `package.json` scripts:

```json
"generate:app-types": "bin/app-typegen"
```

Then, you can simply run `npm run generate:app-types` manually or with your CI setup to (re)generate the types.

## Importing

Modify the `package.json` for the package you would like to use the types. In my case, `extensions/order-stats/package.json`.

Adding, `"app-types": "file:../../../types"` to `devDependencies`, then running `npm install`.

Now, you'll be able to import the types without compilation errors or warnings as such:

```typescript
// extensions/order-stats/src/BlockExtension.tsx

import { type PaginatedRecords } from "app-types/paginate/index";
import { type ShopifyOrderIdValue } from "app-types/value/id";
```
