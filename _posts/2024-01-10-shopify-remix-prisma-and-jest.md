---
layout: post
title: 'Shopify Remix, Prisma, and Jest'
permalink: shopify-remix-prisma-and-jest
date: '2024-01-10 13:17:03'
---

## Introduction

Shopify has *(once again)* changed up their app framework and templates. This time, they're utilizing Remix which is a React-based web framework, and Prisma which is an ORM.

Recently, I developed a large loyalty application utlizing the new framework. Because this app is critical to the merchant's shop, I wanted to ensure the business logic was working correctly.

For my needs, I wanted to do both unit tests on specific code and integration tests. But, I was disappointed to see the framework setup offered by Shopify did not have testing built-in, nor any docs on how someone could get going on testing.

With Prisma, you can mock the database returns from Prisma (example `findMany`) out of the box [for unit tests](https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing).

```js
const record = {
  id: 1,
  title: "Example",
  isDeleted: false,
  deletedAt: ...,
  createdAt: ...,
  updatedAt: ...,
};
prismaMock.places.create.mockResolvedValue(record);

const result = await PlacesRepository(prismaMock).create(record.title); // returns a model
expect(result.toJSON()).toEqual(record);
```

However, in terms of integration tests, a setup would be required to actually setup Prisma to communicate with a test database. It took a while to get working properly so I thought I would share the process.

## Testing Setup

*Note: This assumes you are using Remix with Typescript.*

### Dependencies

`npm install --save-dev jest ts-jest`

### Scripts

Open `package.json` and add the following to the end of your `scripts` object:

```conf
/* package.json */
"test": "jest",
"test:coverage": "jest --coverage",
"test:db:generate": "prisma generate --schema ./prisma/schema.test.prisma",
"test:db:deploy": "prisma migrate deploy --schema ./prisma/schema.test.prisma",
"test:db:reset": "prisma db push --force-reset --accept-data-loss --skip-generate --schema ./prisma/schema.test.prisma"
```

These commands will be utilized later.

### Jest

Open (or create) `jest.config.js` and input:

```js
/* jest.config.js */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./app/mocks.ts"],
};
```

### Git Ignore

Add the following to your `.gitignore`:

```conf
/prisma/*.sqlite
/prisma/*.sqlite-journal
/coverage
```

### Schema

Duplicate your `prisma/schema.prisma` file to `prisma/schema.test.prisma`. Then, change the `datasource` to:

```conf
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

*Note: Alternatively, create a script entry such as `test:db:create-schema` to run before the other `test:db` scripts to grab your existing schema, copy it, and replace the `url` value so its automatic.*

## Mocks Setup

### Prisma

#### mocks.prisma.ts

Create a file `app/mocks.prisma.ts` with the following contents:

```js
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, beforeAll, beforeEach } from "@jest/globals";
import type { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { unlink } from "fs/promises";

// Were types generated for the database?
let generatedTypes = false;

/**
 * Run an NPM command.
 *
 * @param script - Script to run.
 */
function npm(script: string) {
  execSync(
    ["npm", "run", script].join(" "),
    {
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    },
  );
}

/**
 * Generates the types, creates the database.
 */
async function createDatabase() {
  if (!generatedTypes) {
    npm("test:db:generate");
    generatedTypes = true;
  }

  npm("test:db:deploy");
}

/**
 * Destroy the database.
 *
 * @param client - Prisma client.
 */
async function destroyDatabase(client: PrismaClient) {
  // Disconnects Prisma
  await client.$disconnect();

  // Remove database
  await unlink((process.env.DATABASE_URL as string).replace("file:", ""));
}

/**
 * Resets the database in between each test.
 */
function resetDatabase() {
  npm("test:db:reset");
}

/**
 * Seeds the database with initial data.
 *
 * @param client - Prisma client.
 */
function seedDatabase(client: PrismaClient) {
  return Promise.allSettled([
    // Seed shop session
    client.session.create({ data: {
      id: "example.myshopify.com_id",
      shop: "example.myshopify.com",
      accessToken: "token",
      state: "",
      isOnline: false,
    }});

    /*
     * Your other initial seed data here.
     */
  ]);
}

/**
 * To be used on test suites which need this Prisma setup.
 */
export function prismaHooks(client: PrismaClient) {
  beforeAll(createDatabase);
  afterAll(() => destroyDatabase(client));
  beforeEach(async () => {
    resetDatabase();
    await seedDatabase(client);
  });
}
```

What this file does is utilize's Jest's global hooks (`beforeAll`, `afterAll`, etc) to setup and teardown the database for each test suite, if you invoke `prismaHooks`.

* `generatedTypes` tracks if Prisma command to generate types was ran, since we need to do this only once
* `npm()` runs a script from `pacakge.json` with environment variables passed in (important one is `DATABASE_URL`)
* `createDatabase()` generates the Prisma types (if not done already) and creates a SQLite database with the Prisma migrations
* `destroyDatabase()` disconnects Prisma from the database then deletes the SQLite file
* `resetDatabase()` force empties the database, so its ready for the next test

Before each test suite is ran, the database creation process is trigger. After each test suite is ran, the database deletion process is triggered. Finally, before each individual test, the reset/seed database process is triggered.

### db.server.ts

Create a file `app/__mocks__/db.server.ts` with the following content. This will be used by Jest to replace `app/db.server.ts` with this file.

```js
import { PrismaClient } from "@prisma/client";
import * as path from "path";

// Database path to ../prisma/test-[time].sqlite
const dbPath = path.resolve(__dirname, "..", "..", "prisma", `test-${new Date().getTime()}.sqlite`);

// Set database URL override
process.env.DATABASE_URL = `file:${dbPath}`;

// Prisma client
const prisma = new PrismaClient();
export default prisma;
```

* `dbPath` sets the path of where our test SQLite database will live, `prisma/test-[time].sqlite`
* `dbPath` is then is used to set the `DATABASE_URL`

This ensures a unique database for each test suite.

### Jest

Create a file `app/mocks.ts` with the following contents to tell Jest to use the mock Prisma setup.

```js
/* app/mocks.ts */
import { jest } from "@jest/globals";

jest.mock("./db.server");
```

## Usage

You are now ready to do integration tests!

```js
/* app/order/processor.test.ts */
import { describe, expect, it } from "@jest/globals";
import db from "../db.server";
import { prismaHooks } from "../mocks.prisma";
import { ShopifyClient, ShopifyFixture } from "../mocks.clients";
// etc...

/* just an example... */

// Add our hooks for this suite
prismaMocks(db);

describe("order processor", () => {
  it("should insert order", async () => {
    const orderId = OrderId("gid://shopify/Order/1");
    const customerId = CustomerId("gid://shopify/Customer/1");
    const product1 = ProductId("gid://shopify/Product/1");
    const prodcut2 = ProductId("gid://shopify/Product/2");

    // Job data
    const jobData = {
      order: {
        id: orderId.toInt(),
        admin_graphql_id: orderId.toGql(),
        tags: [],
        total_price: "115.00",
        customer: {
          id: customerId.toInt(),
        },
        line_items: [
          {
            product_id: p1.toInt(),
            price: "100.00",
            quantity: 1,
          },
          {
            product_id: p2.toInt(),
            price: "15.00",
            quantity: 1,
          },
        ],
      },
      shop: "example.myshopify.com",
    };

    // Shopify GraphQL mock client
    const client = ShopifyClient(
      ShopifyFixture("product-no-tag", "product/no-override-tag"),
      ShopifyFixture("product-with-tag", "product/with-override-tag"),
      ShopifyFixture("add-tag", "tags-add-customer"),
    );

    // Run the processor
    const [retOrderId, retOustomerId, retSum]: JobReturn = await processor({
      db,
      client,
      job: { data: jobData },
    });
    expect(retOrderId.isSame(orderId)).toBe(true);
    expect(retCustomerId.isSame(customerId)).toBe(true);
    expect(retSum.isSame(Cents(3000)));
  });
});
```

Now, running `npm run test` will give us a testing result!

```bash
npm run test:coverage

> test:coverage
> jest --coverage

 PASS  app/order/processor.test.ts (10.12 s)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        12.44 s
```

Success! I hope this helps you run integrations tests with Prisma and Jest.

## Tests running slow?

There are several results on the web of people having issues of Jest running slow for Typescript. There are several solutions offered. Example:

1. **`maxWorkers` flag**: Add `--maxWorkers=[num]`, example: `npm run test -- --maxWorkers=3`
2. **`runInBand` flag**: Add `--runInBand` which runs test in sync, example: `npm run test -- --runInBand`
3. **Remove ts-node**: `ts-node` is slow, you can try swapping to `swc` with it's Jest support

My app is fairly chunky, and in my testing of speeds the results are as followed:

* **Running as-is**: 39 seconds
* **Running with maxWorkers=4**: 32 seconds
* **Running with runInBand**: 62 seconds
