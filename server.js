//  server.js

//  require modules
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var unirest = require('unirest');
var express = require('express');

//  app init
var app = express();

//  require mongoose models
var Contact = require('./app/models/contact');
var User = require('./app/models/user');

//  use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mongoodr promise lib
mongoose.Promise = global.Promise;

//  db connection
mongoose.connect('mongodb://localhost:27017/Mhint');

//  set port
var port = process.env.PORT || 3000;

// log
app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var date = new Date();
	console.log("["+date+"]["+req.method+"]["+req.url+"]");
	next();
});

//  User Router
var user_router = require('./app/routers/user_router');
app.use(user_router);

//  Food Router
var food_router = require('./app/routers/food_router');
app.use(food_router);

//  Need Router
var need_router = require('./app/routers/need_router');
app.use(need_router);

//  Shopping Router
var shopping_router = require('./app/routers/shopping_router');
app.use(shopping_router);

//  start server
app.listen(port);
console.log('Server started on port ' + port);
