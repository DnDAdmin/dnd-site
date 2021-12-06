var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressSession = require('express-session');

var indexRouter = require('./routes/index');
var formsRouter = require('./routes/forms');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var emailRouter = require('./routes/emails');

var expressMongoDb = require('mongo-express-req');
// var mongoURL = "mongodb+srv://superUser:Super399049!@cluster0.czxy3.mongodb.net/Reviews?retryWrites=true&w=majority"
var mongoURL = 'mongodb+srv://dndgroupsuper:Mongo399049@cluster0.lufhz.mongodb.net/dndgroup?retryWrites=true&w=majority'

var app = express();

var header = 'NRJohnson | '



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret: 'max', saveUninitialized: false, resave: false, secure: true}))
app.use(expressMongoDb(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true}));

app.use('/', indexRouter)
app.use('/forms', formsRouter)
app.use('/users', usersRouter)
app.use('/admin', adminRouter)
app.use('/emails', emailRouter)





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
