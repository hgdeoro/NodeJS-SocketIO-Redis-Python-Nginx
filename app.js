/*
 * Copyright (c) 2014 Horacio G. de Oro - hgdeoro@gmail.com
 * MIT License - See LICENSE.txt
 */

/*
 * Module dependencies.
 */

var _express = require('express');
var _routes = require('./routes');
var _notifications = require('./routes/notifications');
var _http = require('http');
var _path = require('path');
var _io = require('socket.io');
var _redis = require('redis');
var _httpProxy = require('http-proxy');

/*
 * Setup Express
 */

var app = _express();

// all environments
app.set('nginx', process.env.NGINX || 'false');
app.set('port', process.env.PORT || 3000);
app.set('views', _path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(_express.favicon());
app.use(_express.logger('dev'));
app.use(_express.json());
app.use(_express.urlencoded());
app.use(_express.methodOverride());
app.use(app.router);
app.use(_express.static(_path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(_express.errorHandler());
}

/*
 * Setup HTTP server and Socket.IO
 */

var server = _http.createServer(app);
var io = _io.listen(server);

/*
 * Map URLs
 */

app.get('/', function(req, res) {
  res.redirect('/io');
  res.end();
});
app.get('/io', _routes.index);
app.get('/io/notifications', _notifications.notifications);

//
// If not using Nginx, we need to proxy the GETs done to /python to the python
// server on port 3010.
//
// The app. at /python is the "original" application, the application that can't
// handle Socket.IO. That application knows the logged in user, and is in charge
// of generating the notifications.
//

if (app.get('nginx') === 'false') {
  console.log("Not using Nginx... Will proxy /python");

  var proxy = _httpProxy.createProxyServer();

  //
  // Proxy requests to Python http server
  // This is required to avoid setting up Nginx
  //
  var pythonProxy = function(req, res) {
    console.log("Proxying request...");
    proxy.web(req, res, {
      target : 'http://localhost:3010'
    }, function(e) {
      console.log("err: " + e);
      var respondeBody = 'ERROR: ' + e;
      res.writeHead(200, {
        'Content-Length' : respondeBody.length,
        'Content-Type' : 'text/plain'
      });
      res.end(respondeBody);
    });
  };

  app.get('/python', pythonProxy);

  // FIXME: proxy POSTs

} else {
  console.log("Using Nginx... Won't proxy /python");

}

//
// Subscribe to the Redis to receive notifications, and re-send it to the client
// using Socket.IO.
//
// This function is the callback passed to 'redisClient.get()'
//
// - socket: Socket.IO object to send notifications to the user
// - redisClient: Redis client, used to subscribe to PUB/SUB messages
// - redisKey: needed to delete the key from Redis after successful retrieval
// - redis_err: redis error, if get() failed this is !== null
// - redis_reply: the value associated to the requested KEY
//

function subscribeUserToNotifications(socket, redisClient, redisKey, redis_err,
    redis_reply) {

  console.log('redisClient.get() - redis_err: "' + redis_err
      + '" - redis_reply: "' + redis_reply + '"');

  // Check if response from Redis is valid
  if (redis_err !== null) {
    socket.emit('internal', {
      type : 'error',
      code : 'USER_ID_RETRIEVAL_RETURNED_ERROR',
      message : 'Error detected when trying to get user id.'
    });
    return;
  }

  // Check if response from Redis is valid
  if (redis_reply === null) {
    socket.emit('internal', {
      type : 'error',
      code : 'USERID_IS_NULL',
      message : 'Couldn\'t get userId.'
    });
    return;
  }

  // FIXME: should use something like 'get-and-delete' if exists
  // FIXME: is this realy neccesary? The key expires quickly, so,
  // maybe this isn't required
  console.log("Removing retrieved key from Redis");
  redisClient.del(redisKey);

  var userId = redis_reply;

  //
  // Hanlde Redis errors
  //
  redisClient.on("error", function(err) {
    // TODO: infor this error to client (using websocket)
    // TODO: close this websocket (so the client knows and reconnect)
    console.log("Error " + err);
  });

  //
  // Handle messages received from Redis
  //
  redisClient.on('message', function(pattern, data) {
    console.log('Suscriber received a message: ' + data);

    // Re-send message to the browser using Socket.IO
    socket.emit('notification', {
      message : data
    });
  });

  //
  // Subscribe to URL of notifications for the user
  //
  var url = '/app/user/' + userId + '/notifications';
  console.log('//------------------------------------------------------------');
  console.log('//');
  console.log("// Subscribing to Reids channel: " + url);
  console.log('//');
  console.log('// To send messages from the command line, run:');
  console.log('//');
  console.log('// $ redis-cli');
  console.log('// redis 127.0.0.1:6379> PUBLISH ' + url + ' "Hey" ');
  console.log('//');
  console.log('//------------------------------------------------------------');
  redisClient.subscribe(url);

  // Inform client the subscription was done
  socket.emit('internal', {
    type : 'success',
    code : 'SUBSCRIPTION_OK',
    message : 'Subscription to pub/sub ok.'
  });

}

//
// Attache '/io/user/notifications' to SocketIO
//
// When a client tryies to subscribe to notifications, it must send a
// uuidCookie. This uuidCookie is a random uuid generated by the original
// application.
//
// The original application must store a KEY/VALUE pair in Redis. The KEY is the
// uuidCookie, and the value is the userId. The userId is the key to make this
// work. The Node.JS app subscribe to Redis channel which contains the userId
// (here we use '/app/user/XXXXX/notifications', where XXXXX is the userId).
//
// When any message to the channel is published, the message is received by
// Node.JS and the message is sent to the client using Socket.IO.
//
// The uuidCookie must be put to Redis with something like:
//
// SET cookie-f156dbe0-1441-47b5-b74c-004cac13af2b 123456 EX 5 NX
//
// where '123456' is the userId, the uuidCookie will be saved for only 5
// seconds, and NX ensures that the uuidCookie DOESN'T exists. It's very
// important to check the SET command was successfull (if it returns error, this
// the generated uuidCookie already exists in Redis).
//
// An alternative to this mechanism whould be to get the http cookies received,
// and using that, try to get the userId.
//
// I consider the uuidCookies secure
//
//

io.of('/io/user/notifications').on('connection', function(socket) {
  console.log('Connection from ' + socket);

  socket.on('subscribe-to-notifications', function(data) {
    console.log('subscribe-to-notifications - data.uuid: "' + data.uuid);

    var redisKey = 'cookie-' + data.uuid;
    var redisClient = _redis.createClient();
    redisClient.get(redisKey, function(err, reply) {
      subscribeUserToNotifications(socket, redisClient, redisKey, err, reply);
    });
  });

});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
