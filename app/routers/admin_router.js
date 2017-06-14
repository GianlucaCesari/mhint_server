var express = require('express');
var apiai = require("api.ai");
var apn = require('apn');
var myToken = "0z1Po89d11REJ";


//  require mongoose models
var UserPosition = require('../models/user_position');
var Need = require('../models/need');
var User = require('../models/user');

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


//  router init
var router = express.Router();

router.route('/admin/notification').post(function(req, res){
	if (req.body.access_token == myToken) {
		if (req.body.mail) {
			User.findOne({mail: req.body.mail}).exec(function(err, user){
				if (err) {
					console.log(err);
					res.status(500).json({message: "Internal Server Error: DB error"});
				} else if (user) {
					var note = new apn.Notification();
					var deviceToken = user.device_token;
					var badge = 0;
					if (user.push_num) {
						user.push_num = user.push_num + 1;
					} else {
						user.push_num = 1;
					}
					user.save();
					badge = user.push_num;

					note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
					note.badge = badge;
					note.sound = "ping.aiff";
					note.alert = req.body.text;
					note.payload = {
						'user': req.body.title,
						'text': req.body.text
					};
					note.topic = "com.gianlucacesari.Mhint";
					var date = new Date();
					apnProvider.send(note, deviceToken).then((result) => {
						var status = "";
						if (result.sent.length > 0) {
							status = "SENT";
						} else {
							status = "FAILED";
						}
						console.log("[" + date + "][PUSH NOTIFICATION][dev][" + status + "][" + user.mail + "]");
					});
					apnProvider2.send(note, deviceToken).then((result) => {
						var status = "";
						if (result.sent.length > 0) {
							status = "SENT";
						} else {
							status = "FAILED";
						}
						console.log("[" + date + "][PUSH NOTIFICATION][prod][" + status + "][" + user.mail + "]");
					});
				} else {
					res.status(404).json({message: "User not found"});
				}
			});
		} else {
			User.find({}).exec(function(err, users){
				if (err) {
					console.log(err);
					res.status(500).json({message: "Internal Server Error: DB error"});
				} else {
					for (i = 0; i < users.length; i++) {
						var note = new apn.Notification();
						var deviceToken = users[i].device_token;
						var badge = 0;
						if (users[i].push_num) {
							users[i].push_num = users[i].push_num + 1;
						} else {
							users[i].push_num = 1;
						}
						users[i].save();
						badge = users[i].push_num;

						note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
						note.badge = badge;
						note.sound = "ping.aiff";
						note.alert = req.body.text;
						note.payload = {
							'user': req.body.title,
							'text': req.body.text
						};
						note.topic = "com.gianlucacesari.Mhint";
						var date = new Date();
						apnProvider.send(note, deviceToken).then((result) => {
							var status = "";
							if (result.sent.length > 0) {
								status = "SENT";
							} else {
								status = "FAILED";
							}
							console.log("[" + date + "][PUSH NOTIFICATION][dev][" + status + "][" + users[i].mail + "]");
						});
						apnProvider2.send(note, deviceToken).then((result) => {
							var status = "";
							if (result.sent.length > 0) {
								status = "SENT";
							} else {
								status = "FAILED";
							}
							console.log("[" + date + "][PUSH NOTIFICATION][prod][" + status + "][" + users[i].mail + "]");
						});
					}
				}
			});
		}
	} else {
		res.status(401).json({message: "Unauthorized: Invalid Access Token"});
	}
});

module.exports = router;
