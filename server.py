#
# https://wiki.python.org/moin/BaseHttpServer
#

import BaseHTTPServer
import SocketServer
import json
import uuid

PORT = 3010

BaseHTTPServer.allow_reuse_address = True

class Handler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_GET(self):
        uuid_cookie = str(uuid.uuid4())
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({ "uuidCookie": uuid_cookie }))


httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
