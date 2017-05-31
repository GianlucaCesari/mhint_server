//  need_router.js

//  require modules
var express = require('express');

//  require mongoose models
var UserPosition = require('../models/user_position');
var Need = require('../models/need');
var User = require('../models/user');

//  router init
var router = express.Router();

function distanceKM(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	return dist.toFixed(2);
}

function getDistance(point1,point2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(point2.lat-point1.lat);  // deg2rad below
  var dLon = deg2rad(point1.long-point1.long);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d * 1.609344;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

router.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	console.log('need_router..');
	next();
});

router.route('/test').post(function(req, res){
	var point = req.body.point;
	UserPosition.findOne({ position: { $geoNear: point }}).exec(function(err,pos){
		if (err) {
			res.send(err);
		} else {
			res.json(pos);
		}
	});
	// var point2 = req.body.point2;
	// var distance = getDistance(point1,point2);
	// var distance = distanceKM(point1.lat, point1.long, point2.lat, point2.long, "K");
	// res.json({point1: point1, point2: point2, distance: distance});
});

router.route('/need/:user_id').post(function(req, res){
	User.findById(req.params.user_id).exec(function(err, user){
		if (err) {
			res.send(err);
		} else {
			var UserPos = new UserPosition();
			UserPos.position.coorinates = [parseFloat(req.body.position.lat), parseFloat(req.body.position.long)];
			// UserPos.long = req.body.position.long;
			UserPos.user_id = user.id;
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
