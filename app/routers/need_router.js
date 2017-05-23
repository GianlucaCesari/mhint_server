//  need_router.js

//  require modules
var express = require('express');

//  require mongoose models
var UserPosition = require('../models/user_position');
var Need = require('../models/need');
var User = require('../models/user');

//  router init
var router = express.Router();

router.use(function(req, res, next){
	console.log('need_router..');
	next();
});

router.route('/need/:user_id').post(function(req, res){
	User.findById(req.params.user_id).exec(function(err, user){
		if (err) {
			res.send(err);
		} else {
			var UserPos = new UserPosition();
			UserPos.lat = req.body.position.lat;
			UserPos.long = req.body.position.long;
			UserPos.save(function(err){
				if (err) {
					res.send(err);
				} else {
					user.positions = user.positions || [];
					user.positions.push(UserPos);
					user.save(function(err){
						if (err) {
							res.send(err);
						} else {
							var need = new Need();
							need.user = user;
							need.request_position = UserPos;
							need.name = req.body.name;
							need.description = req.body.description;
							need.type = req.body.type;
							need.save(function(err){
								if (err) {
									res.send(err);
								} else {
									res.json(need);
								}
							});
						}
					})
				}
			});
		}
	});
});

router.route('/needs').get(function(req, res){
	Need.find().populate('user').populate('target_users').populate('request_position').exec(function(err, needs){
		if (err) {
			res.send(err);
		} else {
			res.json(needs);
		}
	});
});

module.exports = router;
