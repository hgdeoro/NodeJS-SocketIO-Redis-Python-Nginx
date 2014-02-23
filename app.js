
/**
 * Module dependencies.
 */

var _express = require('express');
var _routes = require('./routes');
var _user = require('./routes/user');
var _notifications = require('./routes/notifications');
var _http = require('http');
var _path = require('path');
var _io = require('socket.io');
var _redis = require('redis');

var app = _express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', _path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.set('view engine', 'ejs');
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
app.get('/users', _user.list);
app.get('/notifications', _notifications.notifications);

var server = _http.createServer(app);

var io = _io.listen(server);

io.sockets.on('connection', function(socket) {
  console.log('Connection from ' + socket);
  var subscriber = _redis.createClient();

  subscriber.on("error", function(err) {
    // TODO: infor this error to client (using websocket)
    // TODO: close this websocket (so the client knows and reconnect)
    console.log("Error " + err);
  });

  subscriber.on('message', function(pattern, data) {
    console.log('Suscriber received a message: ' + data);
    socket.send(data);
  });

  subscriber.subscribe("/app/user/123/notifications");
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
