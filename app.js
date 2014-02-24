/*
 * Copyright (c) 2014 Horacio G. de Oro - hgdeoro@gmail.com
 * MIT License - See LICENSE.txt
 */

/**
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

// app.configure(function() {
// app.use(function(req, res, next) {
// res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3010/python");
// return next();
// });
// // app.use(express.static(path.join(application_root, "StaticPages")));
// // app.use(express.errorHandler({
// // dumpExceptions : true,
// // showStack : true
// // }));
// });

var server = _http.createServer(app);
var io = _io.listen(server);

function redirectToIo(req, res) {
  res.redirect('/io');
  res.end();
}

// Map urls
app.get('/', redirectToIo);
app.get('/io', _routes.index);
app.get('/io/notifications', _notifications.notifications);

if (app.get('nginx') === 'false') {
  console.log("Not using Nginx... Will proxy /python");

  var proxy = _httpProxy.createProxyServer();

  //
  // Proxy requests to Python http server
  // This is required to avoid setting up Nginx
  // If you use Nginx, you should remove/comment this
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

} else {
  console.log("Using Nginx... Won't proxy /python");

}

//
// Subscribe to the Redis to receive notifications, and re-send it to the client
// using Socket.IO
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
  console.log("Subscribing to " + url);
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
