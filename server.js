//  server.js

//  require modules
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var unirest = require('unirest');
var express = require('express');


//  app init
var app = express();
// app.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = Infinity;

//  require mongoose models
var AuthApplication = require('./app/models/auth_application');

//  use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Mongoose promise lib
mongoose.Promise = global.Promise;

//  db connection
mongoose.connect('mongodb://localhost:27017/Mhint');

//  set port
var port = process.env.PORT || 3000;

// logs and authorization
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // if (req.url == "/apikey") {
  // 	var date = new Date();
  // 	console.log("["+date+"][DEVREQUEST]["+req.method+"]["+req.url+"]");
  // 	next();
  // } else {
  // 	AuthApplication.findOne({api_key: req.headers.authorization}).exec(function(err, app){
  // 		if (err) {
  // 			res.send(err);
  // 		} else {
  // 			if (app) {
  // 				if (app.status == "pending") {
  // 					res.json({status: 401 ,message: "unauthorized, your api_key request in pending"});
  // 				} else if (app.status == "revoked") {
  // 					res.json({status: 401 ,message: "unauthorized, your api_key was revoked"});
  // 				} else if (app.status == "active") {
  // 					var date = new Date();
  // 					console.log("["+date+"]["+app.app_name+"]["+req.method+"]["+req.url+"]");
  // 					next();
  // 				} else {
  // 					res.json({status: 401 ,message: "unauthorized"});
  // 				}
  // 			} else {
  // 				res.json({status: 401 ,message: "unauthorized"});
  // 			}
  // 		}
  // 	});
  // }

  if (req.headers.authorization) {
    console.log(req.headers.authorization);
  }
  var date = new Date();
  var append = "";
  if (req.body.mail) {
    append = "[" + req.body.mail + "]";
  } else if (req.query.mail) {
    append = "[" + req.query.mail + "]";
  } else if (req.query.id) {
    append = "[" + req.query.id + "]";
  }
  console.log("[" + date + "][" + req.method + "][" + req._parsedUrl.pathname + "]" + append);
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

// Allergenic Diet Router
var allergenic_diet_router = require('./app/routers/allergenic_diet_router');
app.use(allergenic_diet_router);

// Chatbot Router
var chatbot_router = require('./app/routers/chatbot_router');
app.use(chatbot_router);

// Chatbot Router
var admin_router = require('./app/routers/admin_router');
app.use('/admin', admin_router);

//  start server
app.listen(port);
console.log('Server started on port ' + port);
