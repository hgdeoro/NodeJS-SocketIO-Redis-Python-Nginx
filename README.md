# NodeJS-SocketIO-Redis-Python-Nginx

Simple Node.JS + Socket.IO application integrated to Python using Redis and published using Nginx. Python isn't really required... any language that can publish to Redis will be able to send asynchronous notifications to users.

This **IS NOT** a "public chat" example. Each user get it's own notifications.

![Overview](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/NodeJS-SocketIO-Redis-Python-Nginx.png)


## Overview

There are 4 servers:

* Nginx
  * to expose all the software within a single URL (avoid Access-Control-Allow-Origin problems)
  * support websockets :-D
* Python
  * The main web server / application server
  * See [server.py](server.py)
* Node.JS + Socket.IO
  * Subscribe to a Redis channel and send received messages to the browser using Socket.IO
  * Each user of the "original" application got a differetn channel
  * See [app.js](app.js)
* Redis
  * used to share a 'cookie' between Python and Node.JS, to securely identify the user from NodeJS
  * used to implement publisher/subscriber... Any message published to Redis will be sent to the user using Socket.IO

## Uses

* Redis server
* Nginx server
* Node.JS + Express + Socket.IO + radis client
* Python + python redis client

## How to use

Start Nginx

    $ sudo service nginx start

Start Redis

    $ sudo service redis start

Start Node.JS

    $ env NGINX=true node app.js

Start Python server

    $ env SAMPLE_USERID=5654 python server.py

Go to: [http://localhost:3000/io/](http://localhost:3000/io/)

## TODO

- [ ] make work proxying of POSTs (to avoid Access-Control-Allow-Origin problems)
- [ ] add instructios to use with/without Nginx
- [x] ~~add diagrams~~
- [x] ~~add requirements.txt for python libraries~~
- [ ] add Django and uWSGI
- [ ] document used ports and how to launch nodejs / python server
- [ ] explain what uuidCookie is


## Sequence diagram

![Sequence diagram](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/sequence-diagram.png)

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org)) - Nodeclipse is free open-source project that grows with your contributions.
