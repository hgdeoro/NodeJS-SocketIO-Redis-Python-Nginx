
# NodeJS-SocketIO-Redis-Python

Sample Node.JS + Socket.IO application integrated to Python using Redis.

![Overview](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/NodeJS-SocketIO-Redis-Python-Nginx.png)


The intended integration was to send asynchronous notifications to the browser
from events generated from Python/Django.

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

* add instructios to use with/without Nginx
* add diagrams
* add requirements.txt for python libraries
* add Django and uWSGI

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
