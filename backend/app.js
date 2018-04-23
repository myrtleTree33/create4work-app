var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var passport = require('passport');
var GoogleStrategy = require('passport-google-auth').Strategy;

var app = express();

const ENV_SETTINGS = require('./settings.json');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// for passport JS -------------------------------
// start for passport config ----------------
passport.use(new GoogleStrategy({
    clientId: ENV_SETTINGS.auth.google.clientId,
    clientSecret: ENV_SETTINGS.auth.google.clientSecret,
    callbackURL: ENV_SETTINGS.auth.google.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    let user = {};
    console.log('dONE!!!!');
    done(null, profile);
    // User.findOrCreate(..., function (err, user) {
    //   done(err, user);
    // });
  }
));

passport.serializeUser(function(user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // placeholder for custom user deserialization.
  // maybe you are getoing to get the user from mongo by id?
  // null is for errors
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());
app.get('/login', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
}));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect to your app.
    res.redirect('/');
  }
);
// end for passport config ----------------


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
