var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
// const swaggerUI = require('swagger-ui-express');
// const swaggerDocument = require('./swagger/swagger.json');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const options = require('./middleware/knexfile.js');
const knex = require('knex')(options);

app.use((req, res, next)=>{
  req.db = knex;
  next();
})

app.use('/knex', function(req, res, next){
  req.db.raw("SELECT VERSION()").then(
    (version)=>console.log((version[0][0]))

  ).catch((err)=> {console.log(err); throw err})
  res.send("Version logged successfully")
})

app.use(logger('common'));
app.use(helmet());
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/docs', swaggerUI.server, swaggerUI.setup(swaggerDocument))

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
