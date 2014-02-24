#
# https://wiki.python.org/moin/BaseHttpServer
#

import BaseHTTPServer
import SocketServer
import json
import os
import uuid

import redis


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

class Handler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_GET(self):
        # REDIS -> SET cookie-5ebc3e41-709c-4dc7-857c-15233c96516a 12345 EX 10 NX
        if UUID_COOKIE is None:
            uuid_cookie = str(uuid.uuid4())
        else:
            uuid_cookie = UUID_COOKIE

        expire = 5  # 5 seconds
        set_result = redis_server.set("cookie-" + uuid_cookie,
                                      USER_ID,
                                      expire,
                                      nx=True)

        if set_result is True:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok" : True,
                                         "uuidCookie": uuid_cookie }))
        else:
            # It's almos imposible that the same UUID already exists in redis!
            # So... send error...
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok" : False,
                                         "uuidCookie": None }))


httpd = SocketServer.TCPServer(("", PORT), Handler)
httpd.allow_reuse_address = True

print "serving at port", PORT
httpd.serve_forever()
