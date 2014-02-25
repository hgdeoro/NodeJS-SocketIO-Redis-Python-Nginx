# NodeJS-SocketIO-Redis-Python-Nginx

Simple Node.JS + Socket.IO application integrated to Python using Redis and published using Nginx. Python isn't really required... any language that can publish to Redis will be able to send asynchronous notifications to users.

This **IS NOT** a "public chat" example. Each user get it's own notifications.

![Overview](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/NodeJS-SocketIO-Redis-Python-Nginx.png)


## Overview

There are 4 servers:

* Nginx
  * to expose all the software within a single URL (avoid Access-Control-Allow-Origin problems)
  * support web sockets :-D
* Python
  * The main web server / application server
* Node.JS + Socket.IO
  * To subscribe to a Redis pub/sub, and send received messages using Socket.IO
* Redis
  * used to share a 'cookie' between Python and Node.JS, to seurely identify the user from NodeJS
  * used to implement publisher/subscriber... Any message published to Redis will be sent to the user using Socket.IO

## Requires

* Redis server
* Node.JS
* Python + python redis client

## How to use

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


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org)) - Nodeclipse is free open-source project that grows with your contributions.
