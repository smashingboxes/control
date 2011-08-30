exports.index = function(req, res){
  res.send('user index');
};

exports.new = function(req, res){
  res.send('new user');
};

exports.create = function(req, res){
  res.send('create user');
};

exports.show = function(req, res){
  res.send('show user ' + req.params.user);
};

exports.edit = function(req, res){
  res.send('edit user ' + req.params.user);
};

exports.update = function(req, res){
  res.send('update user ' + req.params.user);
};

exports.destroy = function(req, res){
  res.send('destroy user ' + req.params.user);
};
