---
layout: post
title: Prisma, Jest, and MySQL testing
permalink: prisma-jest-mysql-testing
date: '2024-03-28 13:19:23'
---

*This is an alternate extension to my previous post, [Shopify, Remix, Prisma, and Jest](../shopify-remix-prisma-and-jest).*

Follow that post to get to its current state, and we'll modify the existing files to support MySQL.

## Changes

Change `app/__mocks__/db.server.ts` to:

```javascript
/* app/__mocks__/db.server.ts */

// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, beforeEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { existsSync } from "fs";
import * as path from "path";

/**
 * Run an NPM command.
 *
 * @param script - Script to run.
 */
function npm(script: string): Buffer {
  return execSync(["npm", "run", script].join(" "), {
    env: {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
}

/**
 * Seeds the database with initial data.
 */
function seedDatabase() {
  return Promise.allSettled([
    // Seed shop session
    prisma.session.create({
      data: {
        id: "example.myshopify.com_id",
        shop: "example.myshopify.com",
        accessToken: "token",
        state: "",
        isOnline: false,
      },
    }),
    // Add more seed data
  ]);
}

// Path to generated types
const typesPath = path.resolve("node_modules", ".prisma", "client", "index.d.ts");
if (!existsSync(typesPath)) {
  npm("test:db:generate");
}

// Prisma setup... generate a unique database for MySQL, override existing Prisma implementation via Jest mock
const dbName = `test-${new Date().getTime()}`;
process.env.DATABASE_URL = `${process.env.DATABASE_URL}/${dbName}`;
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

beforeEach(async () => {
  npm("test:db:deploy");
  await seedDatabase();
});

afterEach(async () => {
  // Drop the database and disconnect
  await prisma.$executeRawUnsafe(`DROP DATABASE \`${dbName}\`;`);
  await prisma.$disconnect();
});

export default prisma;
```

This will create a unique database in MySQL for each test, then destroy it.

## Example

You reference the existing `db.server.ts` file normally in your tests, as Jest will swap it out with our `__mocks__/db.server.ts` version.

```javascript
/* app/order/processor.test.ts */

import { describe, expect, it } from "@jest/globals";
import db from "../db.server";
import { prismaHooks } from "../mocks.prisma";
import { ShopifyClient, ShopifyFixture } from "../mocks.clients";
// etc...

/* just an example... */

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

## Usage

You would need to pass in a database URL for connection parameters for MySQL, except for the database name, as we generate that normally:

`DATABASE_URL=mysql://root:password@localhost:3306 npm run test --runInBand`

### Docker / Docker-Compose

If you would like to utilize containers for the testing, this is doable as well.

Create a `Dockerfile-test` and `docker-compose.test.yml` in your app root.

```conf
# Dockerfile-test

# Stage 1: Node modules installation
FROM node:18-alpine as testcache

WORKDIR /cache

# Copy in package JSONs, and Prisma must be copied in before running install
COPY package-lock.json .
COPY package.json .
COPY prisma ./prisma

RUN npm install

# Stage 2: Test
FROM node:18-alpine as test

WORKDIR /app

EXPOSE 3000

# Set initial ENVs, can be overwritten in docker-compose.test.yml
ENV NODE_ENV=test
ENV DATABASE_URL=mysql://root:password@db:3306

# Copy in only files we need to complete the tests
COPY app ./app
COPY fixtures ./fixtures
COPY jest.config.js ./jest.config.js
COPY tsconfig.json ./tsconfig.json
COPY --from=testcache /cache .

CMD ["npm", "run", "test", "--", "--verbose", "--runInBand"]
```

This Dockerfile uses Alpine Linux with two stage build... one to install dependencies and cache them, and a second step which uses the cached dependencies and runs the tests.

```yaml
version: '3.9'

services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: "password"
    ports:
      - 3306:3306
    expose:
      - 3306
    volumes:
      - dbdata:/var/lib/mysql
  test:
    build:
      context: .
      dockerfile: Dockerfile-test
    depends_on:
      - db
    environment:
      - NODE_ENV=test
      - DATABASE_URL=mysql://root:password@db:3306
    volumes:
      - ./jest.config.js:/app/jest.config.js
      - ./app:/app/app
      - ./prisma:/app/prisma

volumes:
  dbdata:
```

This Docker Compile file will setup MySQL v8 with a basic password and expose the port, as well as persist our database volume.

It will also setup the app to test, mounting all needed files we need to run the tests.

Then, `docker-compose -f docker-compose.test.yml up --exit-code-from test` to run it.

The first time you run it, it may take time as the cache needs to be built, but after that its super fast in booting and starting the tests.

The `--exit-code-from test` is needed so that Docker Compose will shut down once Jest exits. Without this, the container stays open and running.
