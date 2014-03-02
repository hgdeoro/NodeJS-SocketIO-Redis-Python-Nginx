# NodeJS-SocketIO-Redis-Python-Nginx

Simple **Node.JS** + **Socket.IO** application integrated to **Python/Django** using **Redis** and published to the web using **Nginx**.
Python/Django isn't really required... any language that can publish to Redis will be able to send asynchronous notifications to users.

This **IS NOT** a *public chat* nor *message broadcast* example. Each user get it's own notifications.

### Overview

* the **Python/Django** application is a simple web application. There's where the business logic should exists. This is the applications that knows who is the current logged in users (the `request.user` in Django), knows the *userId* (the `request.user.id` in Django). **Node.JS** makes a request to this server to get the current logged in user, using the same cookies received from the browser.

* the **Node.JS** has no business logic, it's a generic application that retransmits the messages received from **Redis** to **Socket.IO**. The **Node.JS** server receives the cookies from the browser, and retrieves the *userId* from **Django**. The *userId* is used to generate the **Redis** channel name (for example: '/app/user/*USER_ID*/notifications'). A subscription to that channes is done, and each received message is re-sent to the browser using **Socket.IO**.

* the **browser** has the cookies to track the logged in user, and are sent to **Python/Django** and **Node.JS** too. Those cookies are used by **Node.JS**, to trick **Django** and get the userId of the currently logged in user. Since the browsers communicates with **Nginx**, all this happens in the same domain, allowing to share the cookies between **Django** and **Node.JS**.

* **Nginx** is used to expose this applications in a single URL namespace, including the WebSocket connections used by **Socket.IO**.

![Overview](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/NodeJS-SocketIO-Redis-Python-Nginx.png)


### Overview: fallback mechanism, using uuidCookies

* the **Python/Django** application is a simple web application. There's where the business logic should exists. This is the applications that knows who is the current logged in users (the `request.user` in Django), knows the *userId* (the `request.user.id` in Django). To share the *userId* with **Node.JS**, a random UUID is generated (called `uuidCookie`), and is stored in **Redis** for 5 seconds.

* the **Node.JS** has no business logic, it's a generic application that retransmits the messages received from **Redis** to **Socket.IO**. The **Node.JS** server receives the `uuidCookie` from the browser, and retrieves the *userId* from **Redis**. The *userId* is used to generate the **Redis** channel name (for example: '/app/user/*USER_ID*/notifications'). A subscription to that channes is done, and each received message is re-sent to the browser using **Socket.IO**.

* the **browser** uses Ajax to retrieve the `uuidCookie` from the **Python/Django** web application, and send this `uuidCookie` to **Node.JS** to start receiving notifications for the logged in user. Since the browsers and Ajax calls communicates with **Nginx**, all this happens in the same domain, avoiding a lot of problems (Same Origin Policy and related restrictions).

* **Nginx** is used to expose this applications in a single URL namespace, including the WebSocket connections used by **Socket.IO**.

## Servers

There are 4 servers:

* Nginx
  * to expose all the software within a single domain
  * support websockets :-D
  * See [nginx.conf](nginx.conf)
* Python/Django
  * The web application server, where the business logic live
  * See [django_webapp/utils.py](django_webapp/utils.py) and [django_webapp/views.py](django_webapp/views.py) 
* Node.JS + Socket.IO
  * Subscribe to a Redis channel and send received messages to the browser using Socket.IO
  * See [app.js](app.js)
* Redis
  * used to share the `uuidCookie` between Python and Node.JS
  * used to implement publisher/subscriber... Any message published to Redis will be sent to the user using Socket.IO

There is a fifth optional server:

* uWSGI
  * serves the Django application, for production environments
  * start it with the script `uwsgi.sh`

## How to install and use

Clone this repo and install Node.JS and Python libraries

    $ git clone https://github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx.git
    $ cd NodeJS-SocketIO-Redis-Python-Nginx
    $ npm install
    $ virtualenv --no-site-packages virtualenv
    $ . virtualenv/bin/activate
    $ pip install -r requirements.txt
    $ python manage.py syncdb # will create the DB and a new user
    $ python manage.py createsuperuser # OPTIONAL - to create aditional users, to test per-user notifications

Setup Nginx and start it

    $ sudo cp nginx.conf /etc/nginx/sites-enabled/NodeJS-SocketIO-Redis-Python.conf
    $ sudo service nginx start

Start Redis

    $ sudo service redis-server start

Start the Node.JS app

    $ node app.js

Start Python/Django server

    $ python manage.py runserver 3010

Go to: [http://localhost:3333/](http://localhost:3333/), login with the created user, and clic the link "**Notifications**", and send messages to yourself.

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

    $ `env SAMPLE_USERID=12345 python server.py`

In this case, opening multiple tabs and publishing a message to the Redis channel named **/app/user/12345/notifications**
will send the message to all the browsers / tabs.

## uWSGI

To use uWSGI to serve the Django application, start uWSGI with the provided shell script:

    $ `./uwsgi.sh`

and access the site using Nginx, but on port 3334: [http://localhost:3334/](http://localhost:3334/)

## Used ports

* Nginx: 3333 and 3334
* Node.JS: 3000
* Python/Django: 3010
* uWSGI: 3031 (non HTTP)

## Issues

See them at GitHub issues.

## Sequence diagram - standard browser cookies

Here is how the standard browser cookies are used to get the logged in user from Node.JS

![Sequence diagram](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/django/sequence-diagram-browser-cookies.png)


## Sequence diagram - uuidCookie

Here is how uuidCookie is used to get the logged in user from Node.JS

![Sequence diagram](https://raw.github.com/data-tsunami/NodeJS-SocketIO-Redis-Python-Nginx/master/sequence-diagram.png)


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org)) - Nodeclipse is free open-source project that grows with your contributions.
