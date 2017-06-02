//  need_router.js

//  require modules
var express = require('express');
var apn = require('apn');

//  require mongoose models
var UserPosition = require('../models/user_position');
var NeedRequest = require('../models/need_request');
var Need = require('../models/need');
var User = require('../models/user');

//  router init
var router = express.Router();

var apnOptions = {
    token: {
        key: "./app/certs/APNsAuthKey_JYW3R384JL.p8",
        keyId: "JYW3R384JL",
        teamId: "TYT542W43K"
    },
    production: true
};

var apnProvider = new apn.Provider(apnOptions);

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
	UserPosition.findOne({ is_last: true, position: { $geoNear: {type: "Point", coordinates: point}}}).exec(function(err,pos){
		if (err) {
			res.send(err);
		} else {
			User.findById(pos.user_id).exec(function(err, user){
				if (err) {
					res.send(err);
				} else {
					res.json(user);
				}
			});
		}
	});
});

router.route('/need').post(function(req, res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err,user){
			if (err) {
				res.send(err);
			} else {
				var UserNeed = new Need();
				UserNeed.user = user;
				UserNeed.name = req.body.name;
				UserNeed.description = req.body.description;
				UserNeed.type = req.body.type;
				var needCoordinates = [parseFloat(req.body.position.lat), parseFloat(req.body.position.long)];
				UserNeed.request_position.coordinates = needCoordinates;
				UserPosition.findOne({ is_last: true, position: { $geoNear: {type: "Point", coordinates: needCoordinates}}}).exec(function(err,pos){
					if (err) {
						res.send(err);
					} else {
						User.findById(pos.user_id).exec(function(err, nearUser){
							if (err) {
								res.send(err);
							} else {
								var UserNeedRequest = new NeedRequest();
								UserNeedRequest.user_receiver = nearUser;
								UserNeedRequest.user_sender = user;
								UserNeedRequest.save(function(err){
									if (err) {
										res.send(err);
									} else {
										//INVIO NOTIFICA
										var note = new apn.Notification();
										var deviceToken = nearUser.device_token;

		    						note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		    						note.badge = 1;
		    						note.sound = "ping.aiff";
		    						note.alert = "Hey " + nearUser.name + ",\n" + user.name + " needs: " + UserNeed.name + "!\nWill you help him?";
		    						note.payload = {
		        					'messageFrom': 'John Appleseed'
		    						};
		    						note.topic = "com.gianlucacesari.Mhint";
		    						apnProvider.send(note, deviceToken).then((result) => {
											console.log("notification: "+JSON.stringify(result));
											UserNeed.user_requests = UserNeed.user_requests || [];
											UserNeed.user_requests.push(UserNeedRequest);
											UserNeed.save(function(err){
												if (err) {
													res.send(err);
												} else {
													res.json({status: 200, message: "OK"});
												}
											});
		    						});
									}
								});
							}
						});
					}
				});
			}
		});
	} else {
		res.json({
				message: "Cannot modify user without identifier"
		});
	}
});

router.route('/needresponse').post(function(req, res){
	NeedRequest.findById(req.body.request_id).exec(function(err, needrequest){
		if (err) {
			res.send(err);
		} else {
			needrequest.accept = req.body.accept;
			User.findById(needrequest.user_sender).exec(function(err, user){
				if (err) {
					res.send(err);
				} else {
					var note = new apn.Notification();
					var deviceToken = user.device_token;

					note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
					note.badge = 1;
					note.sound = "ping.aiff";
					if (req.body.accept) {
						note.alert = user.name + " someone accepted your request!";
					} else {
						note.alert = user.name + " your request was not accepted!";
					}
					note.payload = {
						'messageFrom': 'John Appleseed'
					};
					note.topic = "com.gianlucacesari.Mhint";
					apnProvider.send(note, deviceToken).then((result) => {
						console.log("notification: "+JSON.stringify(result));
						needrequest.save(function(err){
							if (err) {
								res.send(err);
							} else {
								res.json(needrequest);
							}
						});
					});
				}
			});
		}
	})
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
