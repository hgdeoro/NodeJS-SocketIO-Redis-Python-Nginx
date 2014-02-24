exports.notifications = function(req, res) {
  // res.sendfile('views/notifications.html');

  res.render('notifications', {
    nginx : (req.app.get('nginx') !== 'false')
  });
};
