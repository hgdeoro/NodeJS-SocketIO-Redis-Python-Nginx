exports.notifications = function(req, res) {
  // res.render('notifications'); // Doesn't works
  // res.send('notifications, baby!'); // Works
  res.sendfile('views/notifications.html');
};
