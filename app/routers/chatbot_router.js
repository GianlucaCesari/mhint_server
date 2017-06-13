var express = require('express');
var apiai = require("api.ai");
var apn = require('apn');


//  require mongoose models
var ShoppingList = require('../models/shopping_list');
var ShoppingItem = require('../models/shopping_item');
var UserPosition = require('../models/user_position');
var WeeklyPlan = require('../models/weekly_plan');
var Recipe = require('../models/recipe');
var Need = require('../models/need');
var Food = require('../models/food');
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


//routes

router.route('/chat').post(function(req, res) {
  if (req.body.mail) {
    // api.ai connection
    var nlp = new apiai({
      token: "fb6d48f1ebf04969b8791576731e4f5b",
      session: req.body.mail
    });
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Error"
        });
      } else if (user) {
        nlp.text(req.body.chat, {
          sessionId: req.body.mail
        }).then(function(response) {
          console.log(response);
          var resultChat = {
            text: "",
            models: "",
            obj: {}
          };
          //CHECK VALIDITY OF QUERY
          if (response.result.score > 0.6) {
            //CHOOSE THE RIGHT ACTION
            switch (response.result.action) {
              case "show_grocery_list":
                resultChat.models = "shopping_list";
                ShoppingList.findOne({
                  user: user._id,
                  completed: false
                }, {}, {
                  sort: {
                    'created_at': -1
                  }
                }).populate('items').exec(function(err, list) {
                  if (err) {
                    console.log(err);
                    res.status(500).json({
                      message: "Internal Server Error: DB error"
                    });
                  } else if (list) {
                    resultChat.obj = list;
                    resultChat.text = user.name + ", " + response.result.fulfillment.messages[0].speech;
                    res.status(200).json(resultChat);
                  } else {
                    resultChat.text = user.name + ", " + response.result.fulfillment.messages[0].speech;
                    res.status(200).json(resultChat);
                  }
                });
                break;
              case "add_grocery_list":
                resultChat = response.result.fulfillment.messages[0].speech;
                break;
              case "remove_from_shopping_list":
                resultChat = response.result.fulfillment.messages[0].speech;
                break;
              case "info_list":
                resultChat = response.result.fulfillment.messages[0].speech;
                break;
              case "need_action":
								resultChat.models = "need_action";
                var UserNeed = new Need();
                UserNeed.user_sender = user;
                UserNeed.name = response.result.parameters.need_subject;
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
														resultChat.text = response.result.fulfillment.messages[0].speech;
														resultChat.obj = UserNeed;
                            res.status(200).json(resultChat);
                          }
                        });
                      } else {
												resultChat.text = "Sorry "+user.name+", I can't find available pepole!";
												res.status(200).json(resultChat);
                      }
                    });
                  } else {
										resultChat.text = "Sorry "+user.name+", I can't find available pepole!";
										res.status(200).json(resultChat);
                  }
                });
                // resultChat = response.result.fulfillment.messages[0].speech;
                break;
              case "remind_grocery_shopping": //NSFW

                resultChat = response.result.fulfillment.messages[0].speech;
                break;
              default:
                // DEFAULT FALLBACK RESPONSES (RANDOM)
                resultChat.text = "Sorry " + user.name + ", I'm not sure how to help with that.";
                res.status(200).json(resultChat);
            }
          } else {
            // DEFAULT FALLBACK RESPONSES (RANDOM)
            resultChat.text = "Sorry " + user.name + ", I'm not sure how to help with that.";
            res.status(200).json(resultChat);
          }
        }).error(function(error) {
          console.log(err);
          res.status(500).json({
            message: "error",
            value: error
          }); //DA VEDERE COME MANDARE AD ANDRE
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

module.exports = router;
