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

Clone this repo and install Node.JS and Python libraries

    $ git clone https://github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx.git
    $ cd NodeJS-SocketIO-Redis-Python-Nginx
    $ npm install
    $ virtualenv --no-site-packages virtualenv
    $ . virtualenv/bin/activate
    $ pip install -r requirements.txt

Setup Nginx and start it

    $ sudo cp sudo cp nginx.conf /etc/nginx/sites-enabled/NodeJS-SocketIO-Redis-Python.conf
    $ sudo service nginx start

Start Redis

    $ sudo service redis-server start

Start the Node.JS app

    $ env NGINX=true node app.js

Start Python server

    $ env SAMPLE_USERID=5654 python server.py

Go to: [http://localhost:3333/io](http://localhost:3333/io)


## Used ports

* Nginx: 3333
* Node.JS: 3000
* Python: 3010

## TODO

* [X] ~~add instructios to use with/without Nginx~~
* [X] ~~add diagrams~~
* [X] ~~add requirements.txt for python libraries~~
* [X] ~~document used ports and how to launch nodejs / python server~~
* [ ] add Django and uWSGI (this will take some this... I'm working on it on the 'django' branch)
* [ ] explain what uuidCookie is
* [ ] make work proxying of POSTs on Node.JS (to avoid Access-Control-Allow-Origin problems).
  * This is requiered only when NOT using Nginx


## Sequence diagram

![Sequence diagram](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/sequence-diagram.png)

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org)) - Nodeclipse is free open-source project that grows with your contributions.
