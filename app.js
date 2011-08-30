
/**
 * Module dependencies.
 */

var express = require('express')
  , crypto = require('crypto')
  , Resource = require('express-resource');

var app = express.createServer(
    express.bodyParser()
  , express.cookieParser()
  , express.session({ secret: 'keyboard cat' })
  , express.logger()
  );

app.resource('users', require('./user'));
app.set('view engine', 'ejs');

app.dynamicHelpers({
  messages: require('express-messages')
});

app.dynamicHelpers({
  // Another dynamic helper example. Since dynamic
  // helpers resolve at view rendering time, we can
  // "inject" the "page" local variable per request
  // providing us with the request url.
  page: function(req, res){
    return req.url;
  } 
});

// Generate a salt for the user to prevent rainbow table attacks
// for better security take a look at the bcrypt c++ addon:
// https://github.com/ncb000gt/node.bcrypt.js

var users = {
  admin: {
    name: 'admin'
    , salt: 'randomly-generated-salt'
    , pass: hash('admin', 'randomly-generated-salt')
  }
};

// Used to generate a hash of the plain-text password + salt

function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}
// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  if (user.pass == hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid
  fn(new Error('invalid password'));
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('error','Access denied!');
    res.redirect('/login');
  }
}

function accessLogger(req, res, next) {
  console.log('/restricted accessed by %s', req.session.user.name);
  next();
}

app.get('/', function(req, res){
  res.redirect('/login');
});

app.get('/restricted', restrict, accessLogger, function(req, res){
  res.send('Wahoo! restricted area');
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('home');
  });
});

app.get('/login', function(req, res){
  if (req.session.user) {
    req.flash('info','Authenticated as ' + req.session.user.name);
  }
  res.render('login');
});

app.post('/login', function(req, res){
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function(){
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        res.redirect('back');
      });
    } else {
      req.flash('error', 'Authentication failed, please check your '
        + ' username and password.');
      res.redirect('back');
    }
  });
});

app.listen(3000);
console.log('Express started on port 3000');
