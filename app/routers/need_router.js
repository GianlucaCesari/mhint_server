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
    teamId: "L4KF22FNCY"
  },
  production: false
};

var apnOptions2 = {
  token: {
    key: "./app/certs/APNsAuthKey_JYW3R384JL.p8",
    keyId: "JYW3R384JL",
    teamId: "L4KF22FNCY"
  },
  production: true
};

var apnProvider = new apn.Provider(apnOptions);
var apnProvider2 = new apn.Provider(apnOptions2);

function distanceKM(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1 / 180
  var radlat2 = Math.PI * lat2 / 180
  var theta = lon1 - lon2
  var radtheta = Math.PI * theta / 180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515
  if (unit == "K") {
    dist = dist * 1.609344
  }
  return dist.toFixed(2);
}

function getDistance(point1, point2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(point2.lat - point1.lat); // deg2rad below
  var dLon = deg2rad(point1.long - point1.long);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1.609344;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

router.route('/need').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        res.send(err);
      } else {
        var UserNeed = new Need();
        UserNeed.user_sender = user;
        UserNeed.name = req.body.name;
        UserNeed.description = req.body.description;
        if (req.body.type) {
          UserNeed.type = req.body.type;
        }
        var needCoordinates = [parseFloat(req.body.lat), parseFloat(req.body.long)];
				UserNeed.display_position.lat = parseFloat(req.body.lat);
				UserNeed.display_position.long = parseFloat(req.body.long);
        UserNeed.request_position.coordinates = needCoordinates;
        UserPosition.findOne({
          is_last: true,
          position: {
            $geoNear: {
              type: "Point",
              coordinates: needCoordinates
            }
          },
          user_id: {
            $nin: user._id
          }
        }).exec(function(err, pos) {
          if (err) {
            res.send(err);
          } else {
            User.findById(pos.user_id).exec(function(err, nearUser) {
              if (err) {
                res.send(err);
              } else {
                UserNeed.user_receiver = nearUser;
                UserNeed.save(function(err) {
                  if (err) {
                    res.send(err);
                  } else {
                    var note = new apn.Notification();
                    var deviceToken = nearUser.device_token;

                    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                    note.badge = 1;
                    note.sound = "ping.aiff";
                    note.alert = "Hey " + nearUser.name + ",\n" + user.name + " needs: " + UserNeed.name + "!\nWill you help him?";
                    note.payload = {
                      'user': UserNeed.name,
											'text': user.name +" needs: " + UserNeed.name + "!\nWill you help him?"
                    };
                    note.topic = "com.gianlucacesari.Mhint";
                    apnProvider.send(note, deviceToken).then((result) => {
                      console.log("notification: " + JSON.stringify(result));
                    });
                    apnProvider2.send(note, deviceToken).then((result) => {
                      console.log("notification: " + JSON.stringify(result));
                    });
                    res.json({
                      status: 200,
                      message: "OK",
                      value: UserNeed
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

router.route('/needresponse').post(function(req, res) {
  Need.findById(req.body.request_id).populate('user_receiver').populate('user_sender').exec(function(err, needrequest) {
    if (err) {
      res.send(err);
    } else {
      needrequest.status = req.body.status;
      needrequest.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          var note = new apn.Notification();
          var deviceToken = needrequest.user_sender.device_token;

          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 1;
          note.sound = "ping.aiff";
          if (req.body.status == 'accepted') {
            note.alert = needrequest.user_receiver.name + " accepted your request for "+needrequest.name+"!";
						note.payload = {
	            'user': needrequest.name,
	            'text': needrequest.user_receiver.name + ' accepted your request!'
	          };
          } else {
            note.alert = needrequest.user_receiver.name + " refuse your request for "+needrequest.name+"!";
						note.payload = {
	            'user': needrequest.name,
	            'text': needrequest.user_receiver.name + ' refuse your request!'
	          };
          }

          note.topic = "com.gianlucacesari.Mhint";
          apnProvider.send(note, deviceToken).then((result) => {
            console.log("notification: " + JSON.stringify(result));
          });
          apnProvider2.send(note, deviceToken).then((result) => {
            console.log("notification: " + JSON.stringify(result));
          });
          res.json({
            status: 200,
            message: "OK",
            value: needrequest
          });
        }
      });
    }
  })
});

router.route('/requests').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).exec(function(err, user) {
      if (err) {
        res.send(err);
      } else {
        Need.find({
          user_receiver: user._id,
          status: {
            $nin: ["completed", "refused"]
          }
        }).populate('user_sender').sort({created_at:-1}).exec(function(err, reqs) {
          if (err) {
            res.send(err);
          } else {
            res.json(reqs);
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

router.route('/needs').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).exec(function(err, user) {
      if (err) {
        res.send(err);
      } else {
        Need.find({
          user_sender: user._id,
          status: {
            $nin: "completed"
          }
        }).populate('user_receiver').sort({created_at:-1}).exec(function(err, needs) {
          if (err) {
            res.send(err);
          } else {
            res.json(needs);
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

router.route('/needcomplete').post(function(req, res){
	Need.findById(req.body.request_id).populate('user_receiver').populate('user_sender').exec(function(err, need){
		if (err) {
			res.send(err);
		} else {
			need.status = "completed";
			need.save(function(err){
				if (err) {
					res.send(err);
				} else {
					var note = new apn.Notification();
					var deviceToken = need.user_receiver.device_token;

					note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
					note.badge = 1;
					note.sound = "ping.aiff";
					note.alert = "Hey " + need.user_receiver.name + ",\n" + need.user_sender.name + " doesn't need your help for " + need.name + " anymore!";
					note.payload = {
						'user': need.name,
						'text': need.user_sender.name + " doesn't need your help anymore!"
					};
					note.topic = "com.gianlucacesari.Mhint";
					apnProvider.send(note, deviceToken).then((result) => {
						console.log("notification: " + JSON.stringify(result));
					});
					apnProvider2.send(note, deviceToken).then((result) => {
						console.log("notification: " + JSON.stringify(result));
					});
					res.json({status: 200, message: "OK"});
				}
			});
		}
	});
});

module.exports = router;
