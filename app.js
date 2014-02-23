
/**
 * Module dependencies.
 */

var _express = require('express');
var _routes = require('./routes');
var _user = require('./routes/user');
var _http = require('http');
var _path = require('path');
var _socketio = require('socket.io');
var _redis = require('redis');

var app = _express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', _path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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

var server = _http.createServer(app);

var io = _socketio.listen(server);

io.sockets.on('connection', function(socket) {
	socket.emit('news', {
		hello : 'world'
	});
	socket.on('my other event', function(data) {
		console.log(data);
	});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
