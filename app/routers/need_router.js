//  need_router.js

//  require modules
var express = require('express');
var apn = require('apn');

//  require mongoose models
var UserPosition = require('../models/user_position');
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
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
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
        var last24h = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
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
          },
          created_at: {
            "$gte": last24h
          }
        }).exec(function(err, pos) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else if (pos) {
            User.findById(pos.user_id).exec(function(err, nearUser) {
              if (err) {
                console.log(err);
                res.status(500).json({
                  message: "Internal Server Error: DB error"
                });
              } else if (nearUser) {
                UserNeed.user_receiver = nearUser;
                UserNeed.save(function(err) {
                  if (err) {
                    console.log(err);
                    res.status(500).json({
                      message: "Internal Server Error: DB error"
                    });
                  } else {
                    var note = new apn.Notification();
                    var deviceToken = nearUser.device_token;
                    var badge = 0;
                    if (nearUser.push_num) {
                      nearUser.push_num = nearUser.push_num + 1;
                    } else {
                      nearUser.push_num = 1;
                    }
                    nearUser.save();
                    badge = nearUser.push_num;

                    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                    note.badge = badge;
                    note.sound = "ping.aiff";
                    note.alert = "Hey " + nearUser.name + ", " + user.name + " needs: " + UserNeed.name + "!\nWill you help him?";
                    note.payload = {
                      'user': UserNeed.name,
                      'text': user.name + " needs: " + UserNeed.name + "!\nWill you help him?"
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
                      console.log("[" + date + "][PUSH NOTIFICATION][dev][" + status + "][" + nearUser.mail + "]");
                      // console.log("notification: " + JSON.stringify(result));
                    });
                    apnProvider2.send(note, deviceToken).then((result) => {
                      var status = "";
                      if (result.sent.length > 0) {
                        status = "SENT";
                      } else {
                        status = "FAILED";
                      }
                      console.log("[" + date + "][PUSH NOTIFICATION][prod][" + status + "][" + nearUser.mail + "]");
                      // console.log("notification: " + JSON.stringify(result));
                    });
                    res.status(201).json({
                      message: "Created",
                      value: UserNeed
                    });
                  }
                });
              } else {
                res.status(404).json({
                  message: "Not found available User"
                });
              }
            });
          } else {
            res.status(404).json({
              message: "Not found available User"
            });
          }
        });
      } else {
        res.status(404).json({
          message: "User not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

router.route('/needresponse').post(function(req, res) {
  if (req.body.request_id) {
    Need.findById(req.body.request_id).populate('user_receiver').populate('user_sender').exec(function(err, needrequest) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (needrequest) {
        needrequest.status = req.body.status;
        needrequest.save(function(err) {
          if (err) {
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            var note = new apn.Notification();
            var deviceToken = needrequest.user_sender.device_token;
            var badge = 0;
            if (needrequest.user_sender.push_num) {
              needrequest.user_sender.push_num = needrequest.user_sender.push_num + 1;
            } else {
              needrequest.user_sender.push_num = 1;
            }
            needrequest.user_sender.save();
            badge = needrequest.user_sender.push_num;

            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = badge;
            note.sound = "ping.aiff";
            if (req.body.status == 'accepted') {
              note.alert = needrequest.user_receiver.name + " accepted your request for " + needrequest.name + "!";
              note.payload = {
                'user': needrequest.name,
                'text': needrequest.user_receiver.name + ' accepted your request!'
              };
            } else {
              note.alert = needrequest.user_receiver.name + " refused your request for " + needrequest.name + "!";
              note.payload = {
                'user': needrequest.name,
                'text': needrequest.user_receiver.name + ' refused your request!'
              };
            }

            note.topic = "com.gianlucacesari.Mhint";
            var date = new Date();
            apnProvider.send(note, deviceToken).then((result) => {
              var status = "";
              if (result.sent.length > 0) {
                status = "SENT";
              } else {
                status = "FAILED";
              }
              console.log("[" + date + "][PUSH NOTIFICATION][dev][" + status + "][" + needrequest.user_sender.mail + "]");
              // console.log("notification: " + JSON.stringify(result));
            });
            apnProvider2.send(note, deviceToken).then((result) => {
              var status = "";
              if (result.sent.length > 0) {
                status = "SENT";
              } else {
                status = "FAILED";
              }
              console.log("[" + date + "][PUSH NOTIFICATION][prod][" + status + "][" + needrequest.user_sender.mail + "]");
              // console.log("notification: " + JSON.stringify(result));
            });
            res.status(200).json({
              message: "OK",
              value: needrequest
            });
          }
        });
      } else {
        res.status(404).json({
          message: "Need not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

router.route('/requests').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).exec(function(err, user) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        user.push_num = 0;
        user.save();
        Need.find({
          user_receiver: user._id,
          status: {
            $nin: ["completed", "refused"]
          }
        }).populate('user_sender').sort({
          created_at: -1
        }).exec(function(err, reqs) {
          if (err) {
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else if (reqs.length > 0) {
            res.status(200).json({
              message: "OK",
              value: reqs
            });
          } else {
            res.status(404).json({
              message: "Not found",
              value: reqs
            });
          }
        });
      } else {
        res.status(404).json({
          message: "User not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

router.route('/needs').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).exec(function(err, user) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        user.push_num = 0;
        user.save();
        Need.find({
          user_sender: user._id,
          status: {
            $nin: "completed"
          }
        }).populate('user_receiver').sort({
          created_at: -1
        }).exec(function(err, needs) {
          if (err) {
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else if (needs.length > 0) {
            res.status(200).json(needs);
          } else {
            res.status(404).json(needs);
          }
        });
      } else {
        res.status(404).json({
          message: "User not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

router.route('/needcomplete').post(function(req, res) {
  if (req.body.request_id) {
    Need.findById(req.body.request_id).populate('user_receiver').populate('user_sender').exec(function(err, need) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (need) {
        var notify = need.status == 'refused' ? false : true;
        need.status = "completed";
        need.save(function(err) {
          if (err) {
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            if (notify) {
              var note = new apn.Notification();
              var deviceToken = need.user_receiver.device_token;
              var badge = 0;
              if (need.user_receiver.push_num) {
                need.user_receiver.push_num = need.user_receiver.push_num + 1;
              } else {
                need.user_receiver.push_num = 1;
              }
              need.user_receiver.save(function(err) {
                if (err) {
                  res.status(500).json({
                    message: "Internal Server Error: DB error"
                  });
                } else {
                  badge = need.user_receiver.push_num;
                  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                  note.badge = badge;
                  note.sound = "ping.aiff";
                  note.alert = "Hey " + need.user_receiver.name + ", " + need.user_sender.name + " doesn't need your help for " + need.name + " anymore!";
                  note.payload = {
                    'user': need.name,
                    'text': need.user_sender.name + " doesn't need your help anymore!"
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
                    console.log("[" + date + "][PUSH NOTIFICATION][dev][" + status + "][" + need.user_receiver.mail + "]");
                    // console.log("notification: " + JSON.stringify(result));
                  });
                  apnProvider2.send(note, deviceToken).then((result) => {
                    var status = "";
                    if (result.sent.length > 0) {
                      status = "SENT";
                    } else {
                      status = "FAILED";
                    }
                    console.log("[" + date + "][PUSH NOTIFICATION][prod][" + status + "][" + need.user_receiver.mail + "]");
                    // console.log("notification: " + JSON.stringify(result));
                  });
                  res.status(200).json({
                    message: "OK"
                  });
                }
              });
            }
          }
        });
      } else {
        res.status(404).json({
          message: "Need not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

module.exports = router;
