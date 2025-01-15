---
layout: post
title: Basic Symfony Flex with Symfony Server Dockerized
permalink: basic-symfony-flex-with-symfony-server-dockerized
date: '2020-02-04 00:56:22'
---

Symfony Flex allows you to tailor a Symfony application to your needs by building it with "recipes". It provides a way to create a very lean and clean Symfony application with only the bells and whistles you choose.

In this post, I'll show you how to create a Dockerized version of your Flex application that utilizes the Symfony local server for use during local development.

## Setup

_If you already have a Symfony Flex application created, you can skip this section._

`composer create-project symfony/skeleton myapi`

This will create a skeleton project in a directory called `myapi` with everything set up and ready to go in an easy to navigate structure.

Next, we install the API recipe which installs bundles such as Doctrine, CORS handling, Twig templating, validators, etc. It will give you barebones ability to easily create an API base.

`composer req api`

You're now free to create any entities, repositories, controllers, services, etc. that you require, or you can come back to that at a later time, it is not required.

## Dockerizing

### Docker Compose

For this example, we'll simply set up a MySQL server, Redis server, and PHP CLI. We will manage all this through Docker Compose.

    # docker-compose.yml
    version: '3'
    
    services:
      db:
        image: mysql:5.7
        environment:
          MYSQL_ROOT_PASSWORD: root_pwd
          MYSQL_DATABASE: api_db
          MYSQL_USER: api_user
          MYSQL_PASSWORD: api_pass
        volumes:
          - ./docker/db:/var/lib/mysql/data
        ports:
          - '3306:3306'
        restart: always
      redis:
        image: redis
        ports:
          - '6379:6379'
        volumes:
          - ./docker/redis:/data
        entrypoint: redis-server --appendonly yes
        restart: always
      web:
        build:
          context: .
        depends_on:
          - db
          - redis
        volumes:
          - ./:/var/www/html/
        ports:
          - '8080:80'
        stdin_open: true
        tty: true

The above will pull in the `mysql:5.7` image with some initial environment variables _(you're free to replace them)_. It will mount its data volume to `./docker/db` of your `myapi` directory for persistence. It will also map port `3306` on your host machine to forward to `3306` in the container.

Below that, we pull in the `redis` image and mount it's volume to `./docker/redis` of your `myapi` directory for storage. It will also map port `6379` of your host machine to forward to `6379` in the container. You can adjust the entrypoint to your needs.

Lastly, `web` will build a custom image based on a `Dockerfile` below. It will mount your `myapi` directory to `/var/www/html` inside the container. It will also map port `8080` of your host machine to forward to port `80` in the container.

It is also a good idea to add these volume paths to your `.gitignore` to avoid checking them into your repository.

### Dockerfile

    # Dockerfile
    FROM php:7.3-cli
    
    # Remove restirction from installing PHP packages
    RUN rm /etc/apt/preferences.d/no-debian-php
    
    # Install required packages
    RUN apt update && apt install wget php-mysql php-json php-mbstring php-xml php-curl -y
    
    # Extension install
    RUN docker-php-ext-install mysqli pdo pdo_mysql
    
    # Install Symfony package
    RUN wget https://get.symfony.com/cli/installer -O - | bash && mv /root/.symfony/bin/symfony /usr/local/bin/symfony
    
    # Open port 80
    EXPOSE 80
    
    # Run it
    CMD cd /var/www/html && symfony server:start --no-tls --port=80

The above Dockerfile will pull in the `php:7.3-cli` image. Since Symfony's local server will be handling the requests, we do not need Nginx, Apache, mod\_php, or php-fpm.

In the commands, we tell it to install `wget` which is required to install the Symfony CLI tools, and other PHP packages (by removing the APT restriction). We also open up port `80`. At the end, we change our directory to `/var/www/html` where our `myapi` directory is mounted, and run the Symfony local server on port `80`.

## Running

It is a good idea to now modify your `.env.local` file to connect to the container's MySQL instance and Redis instance with the credentials set up in the `docker-compose.yml` file and the special mapping keywords, `redis` and `db` for the address.

Examples:

- `DATABASE_URL=mysql://${DATABASE_USER}:${DATABASE_PASSWORD}@mysql:3306/${DATABASE_NAME}?serverVersion=5.7`
- `REDIS_URL=redis://redis:6379?timeout=5`

Finally, executing `docker-compose up` will build and boot the containers. If you're successful... you should see the Symfony local server running with a message similar to:

`[OK] Web server listening on http://127.0.0.1:80`

Now, if you open your browser to `http://127.0.0.1:8080` _(8080 is our local port which will forward to port 80 in the container),_ you should see the Symfony welcome screen.

As a side note, it would be a good idea to set up a hosts file entry so you don't need to type your localhost every time, and also enabling HTTPS would be a good measure, but not necessarily needed for local development.

## Conclusion

That concludes the basic setup to Dockerize a Symfony Flex API application.

For more information on Symfony Flex, [click here](https://symfony.com/doc/current/quick_tour/flex_recipes.html); or information on Symfony Server, [click here](https://symfony.com/doc/current/setup/symfony_server.html).
