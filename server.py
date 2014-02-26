# -*- coding: utf-8 -*-
"""
Copyright (c) 2014 Horacio G. de Oro - hgdeoro@gmail.com
MIT License - See LICENSE.txt
"""
import random

"""
This emulates the "original" application.

Implements a GET and a POST.

The GET is exposed to generate the uuidCookie. Node.JS does a GET
to get the uuidCookie. In a real application, we would use the
userId of the logged in user instead of the constant 'USER_ID'.

The POST is exposed to emulate when the "original" app generates
events.
"""

#
# https://wiki.python.org/moin/BaseHttpServer
#

import BaseHTTPServer
import SocketServer
import cgi
import json
import os
import uuid

import redis
from redis.exceptions import ConnectionError


PORT = 3010

BaseHTTPServer.allow_reuse_address = True

redis_server = redis.StrictRedis(host='localhost', port=6379, db=0)

#
# Get the userId to return from environment
#
USER_ID = os.environ['SAMPLE_USERID']

#
# If 'UUID_COOKIE' is set, return that instead a random one
#
UUID_COOKIE = os.environ.get('UUID_COOKIE', None)


def send_message(user_id, message):
    url = "/app/user/{0}/notifications".format(user_id)
    redis_server.publish(url, message)


def store_uuid_cookie(userId):
    """
    Generates an uuidCookie and store it in Radis.
    Returns: uuid (string) if stored correctly
    Returns: None if cookie couldn't be stored
    """
    if UUID_COOKIE is None:
        uuid_cookie = str(uuid.uuid4())
    else:
        uuid_cookie = UUID_COOKIE

    expire = 5  # 5 seconds
    set_result = redis_server.set("cookie-" + uuid_cookie,
                                  userId,
                                  expire,
                                  nx=True)

    if set_result is True:
        return uuid_cookie
    else:
        return None


class Handler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_GET(self):
        if USER_ID == 'RANDOM':
            userId = str(random.randint(1, 999999))
            print "Generated userId: {0}".format(userId)
        else:
            userId = USER_ID

        # REDIS -> SET cookie-5ebc3e41-709c-4dc7-857c-15233c96516a 12345 EX 10 NX
        try:
            uuid_cookie = store_uuid_cookie(userId)
        except ConnectionError:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok" : False,
                                         "uuidCookie": None,
                                         "userId": userId,
                                         "message": "Connection to Redis failed." }))
            return

        if uuid_cookie is not None:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok" : True,
                                         "userId": userId,
                                         "uuidCookie": uuid_cookie }))
        else:
            # It's almos imposible that the same UUID already exists in redis!
            # So... send error...
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok" : False,
                                         "userId": userId,
                                         "uuidCookie": None }))

    def do_POST(self):
        # message-text
        length = int(self.headers.getheader('content-length'))
        postvars = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
        message = postvars['message-text'][0]
        userId = postvars['user-id'][0]

        send_message(userId, message)

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok" : True}))

SocketServer.TCPServer.allow_reuse_address = True
httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
