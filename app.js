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

var app = _express();

// all environments
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

// map urls
app.get('/', _routes.index);
app.get('/notifications', _notifications.notifications);

var server = _http.createServer(app);

var io = _io.listen(server);

function xxxxxxx(socket, redisClient, redis_err, redis_reply) {

  console.log('redisClient.get() - redis_err: "' + redis_err
      + '" - redis_reply: "' + redis_reply + '"');

  if (redis_err !== null) {
    socket.emit('error', {
      code : 'USER_ID_RETRIEVAL_RETURNED_ERROR',
      message : 'Error detected when trying to get user id.'
    });
    return;
  }

  if (redis_reply === null) {
    socket.emit('error', {
      code : 'USERID_IS_NULL',
      message : 'Couldn\'t get userId.'
    });
    return;
  }

  var userId = redis_reply;

  redisClient.on("error", function(err) {
    // TODO: infor this error to client (using websocket)
    // TODO: close this websocket (so the client knows and reconnect)
    console.log("Error " + err);
  });

  redisClient.on('message', function(pattern, data) {
    console.log('Suscriber received a message: ' + data);
    socket.emit('notification', {
      message : data
    });
  });

  var url = '/app/user/' + userId + '/notifications';
  console.log("Subscribing to " + url);
  redisClient.subscribe(url);

}

io.of('/io/user/notifications').on('connection', function(socket) {
  console.log('Connection from ' + socket);

  socket.on('subscribe-to-notifications', function(data) {
    console.log('subscribe-to-notifications - data.uuid: "' + data.uuid);

    var redisClient = _redis.createClient();
    redisClient.get('cookie-' + data.uuid, function(err, reply) {
      xxxxxxx(socket, redisClient, err, reply);
    });
  });

});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
