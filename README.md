# NodeJS-SocketIO-Redis-Python-Nginx

Simple *Node.JS* + *Socket.IO* application integrated to *Python* using *Redis* and published to the web using *Nginx*.
Python isn't really required... any language that can publish to Redis will be able to send asynchronous notifications to users.

This **IS NOT** a *public chat* nor *message broadcast* example. Each user get it's own notifications.

### Overview

* the **Python** application emulates a **normal web application**. There's where the business logic should exists. This is the applications that knows who is the current logged in users (the `request.user` in Django), knows the *userId* (the `request.user.id` in Django). To share the *userId* with Node.JS, a random UUID is generated (called `uuidCookie`), and is stored in Redis for 5 seconds.

* the **Node.JS** has no business logic, it's a generic application that retransmits the messages received from Redis to Socket.IO. Node.JS receives the `uuidCookie` from the browser, and retrieves the *userId* from Redis. The *userId* is used to generate the Redis channel name (for example: '/app/user/*USER_ID*/notifications'). A subscription to that channes is done, and each received message is re-sent to the browser using Socket.IO.

* the **browser** uses Ajax to retrieve the `uuidCookie` from the web application (Python), and send this `uuidCookie` to *Node.JS* to start receiving notifications for the logged in user. Since the browsers and Ajax calls communicates with *Nginx*, all this happens in the same domain, avoiding a lot of problems (Same Origin Policy and related restrictions).

* **Nginx** is used to expose this applications in a single URL namespace, including the WebSocket connections used by *Socket.IO*.


![Overview](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/NodeJS-SocketIO-Redis-Python-Nginx.png)


## Servers

There are 4 servers:

* Nginx
  * to expose all the software within a single domain
  * support websockets :-D
  * See [nginx.conf](nginx.conf)
* Python
  * The web application server, where the business logic live
  * See [server.py](server.py)
* Node.JS + Socket.IO
  * Subscribe to a Redis channel and send received messages to the browser using Socket.IO
  * See [app.js](app.js)
* Redis
  * used to share the `uuidiCooki` between Python and Node.JS
  * used to implement publisher/subscriber... Any message published to Redis will be sent to the user using Socket.IO


## How to install and use

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

    $ env SAMPLE_USERID=RANDOM python server.py

Go to: [http://localhost:3333/io](http://localhost:3333/io), and clic the link "**Notifications**", and send messages to yourself.

#### How to send messages from CLI or use multiple browsers or browser tabs

In the console running Node.JS, you should see a message saying something like:

    //------------------------------------------------------------
    //
    // Subscribing to Reids channel: /app/user/976264/notifications
    //
    // To send messages from the command line, run:
    //
    // $ redis-cli
    // redis 127.0.0.1:6379> PUBLISH /app/user/976264/notifications "Hey" 
    //
    //------------------------------------------------------------

Each browser / browser tab simulates a different user (technically, each time the Python server
is asked for the userId, it generates a random user id). Each message sent from the web page is sent
to the same user (other browser or tabs SHOULD NOT receive the text).

To send a message from the command line, run `redis-cli`, and publish a message
to some of the users' channels (use the channel name from the log message above):

    PUBLISH /app/user/976264/notifications "Hey"

If you want the Python server returning the same user id (for example, 12345), you must start the server with:

    $ env SAMPLE_USERID=12345 python server.py

In this case, opening multiple tabs and publishing a message to the Redis channel named **/app/user/12345/notifications**
will send the message to all the browsers / tabs.



## Used ports

* Nginx: 3333
* Node.JS: 3000
* Python: 3010

## TODO

* [X] ~~add instructios to use with/without Nginx~~
+ [X] ~~add diagrams~~
+ [X] ~~add requirements.txt for python libraries~~
+ [X] ~~document used ports and how to launch nodejs / python server~~
+ [X] ~~explain what uuidCookie is~~
+ [ ] move serving of HTML from Node.JS to Python
+ [ ] check if Express is really requiered
* [ ] add Django and uWSGI (this will take some this... I'm working on it on the 'django' branch)


## Sequence diagram

![Sequence diagram](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/sequence-diagram.png)

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org)) - Nodeclipse is free open-source project that grows with your contributions.
