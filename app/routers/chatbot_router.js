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
          // console.log(response.result);
          var resultChat = {
            text: "",
            model: "",
            obj: {}
          };
          //CHECK VALIDITY OF QUERY
          if (response.result.score > 0.6) {
            if (response.result.actionIncomplete) {
              resultChat.text = response.result.fulfillment.messages[0].speech;
              res.status(200).json(resultChat);
            } else {
              //CHOOSE THE RIGHT ACTION
              switch (response.result.action) {
                case "input.welcome":
                  resultChat.model = "welcome_intent";
                  resultChat.text = response.result.fulfillment.messages[0].speech;
                  res.status(200).json(resultChat);
                  break;
                case 'check_recipe':
                  resultChat.model = "check_recipe";
                  resultChat.obj = {
                    date: response.result.parameters.date,
                    type: response.result.parameters.recipe_type
                  };
                  resultChat.text = response.result.fulfillment.messages[0].speech;
                  res.status(200).json(resultChat);
                  break;
                case "show_grocery_list":
                  resultChat.model = "shopping_list";
                  if (req.body.list_id) {
                    ShoppingList.findById(req.body.list_id).populate('items').exec(function(err, list) {
                      if (err) {
                        console.log(err);
                        res.status(500).json({
                          message: "Internal Server Error: DB error"
                        });
                      } else if (list) {
                        var itemFound;
                        if (response.result.parameters.grocery_list_item_name.length > 0) {
                          list.items.forEach(function(item, ind, array) {
                            if (item.name.toLowerCase() == response.result.parameters.grocery_list_item_name[0].toLowerCase()) {
                              itemFound = item;
                            }
                            if (ind == array.length - 1) {
                              if (itemFound) {
                                resultChat.obj = itemFound;
                                var itemName = itemFound.name.charAt(0).toUpperCase() + itemFound.name.slice(1);
                                if (!itemFound.checked) {
                                  resultChat.text = "Yes, I found " + itemName + " in your list.";
                                  res.status(200).json(resultChat);
                                } else {
                                  resultChat.text = user.name + ", I think you've already bought " + itemName;
                                  res.status(200).json(resultChat);
                                }
                              } else {
                                var name = response.result.parameters.grocery_list_item_name[0].charAt(0).toUpperCase() + response.result.parameters.grocery_list_item_name[0].slice(1);
                                resultChat.obj = list;
                                resultChat.text = "I can't find " + name + " in your list!";
                                res.status(200).json(resultChat);
                              }
                            }
                          });
                        } else {
                          resultChat.obj = list;
                          resultChat.text = user.name + ", " + response.result.fulfillment.messages[0].speech;
                          res.status(200).json(resultChat);
                        }
                      } else {
                        resultChat.text = "Hey " + user.name + ", you don't have a list yet!";
                        res.status(200).json(resultChat);
                      }
                    });
                  } else {
                    resultChat.text = user.name + ", activate food section first";
                    res.status(200).json(resultChat);
                  }
                  break;
                case "add_grocery_list":
                  resultChat.model = "add_item";
                  if (req.body.list_id) {
                    ShoppingList.findById(req.body.list_id).populate('items').exec(function(err, list) {
                      if (err) {
                        console.log(err);
                        res.status(500).json({
                          message: "Internal Server Error: DB error"
                        });
                      } else if (list) {
                        if (response.result.parameters.grocery_list_item_name.length <= 2) {
                          var item = new ShoppingItem();
                          var item2;
                          item.name = response.result.parameters.grocery_list_item_name[0];
                          item.value = response.result.parameters.grocery_list_item_quantity[0];
                          item.unit = response.result.parameters.grocery_list_item_unity[0];
                          if (response.result.parameters.grocery_list_item_name.length > 1) {
                            item2 = new ShoppingItem();
                            item2.name = response.result.parameters.grocery_list_item_name[1];
                            item2.value = response.result.parameters.grocery_list_item_quantity[1];
                            item2.unit = response.result.parameters.grocery_list_item_unity[1];
                          }
                          item.save(function(err) {
                            if (err) {
                              console.log(err);
                              res.status(500).json({
                                message: "Internal Server Error: DB error"
                              });
                            } else {
                              list.items.push(item);
                              if (response.result.parameters.grocery_list_item_name.length > 1) {
                                item2.save(function(err) {
                                  if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                      message: "Internal Server Error: DB error"
                                    });
                                  } else {
                                    list.items.push(item2);
                                    list.save(function(err) {
                                      if (err) {
                                        console.log(err);
                                        res.status(500).json({
                                          message: "Internal Server Error: DB error"
                                        });
                                      } else {
                                        resultChat.obj = list;
                                        resultChat.text = response.result.fulfillment.messages[0].speech;
                                        res.status(200).json(resultChat);
                                      }
                                    });
                                  }
                                });
                              } else {
                                list.save(function(err) {
                                  if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                      message: "Internal Server Error: DB error"
                                    });
                                  } else {
                                    resultChat.obj = list;
                                    resultChat.text = response.result.fulfillment.messages[0].speech;
                                    res.status(200).json(resultChat);
                                  }
                                });
                              }
                            }
                          });
                        } else {
                          resultChat.text = "Sorry, I can't add more then two items per time";
                          res.status(200).json(resultChat);
                        }
                      } else {
                        resultChat.text = "Sorry " + user.name + ", I can't do it yet.";
                        res.status(200).json(resultChat);
                      }
                    });
                  } else {
                    resultChat.text = "Sorry " + user.name + ", you need to activate food section first";
                    res.status(200).json(resultChat);
                  }
                  break;
                case "remove_from_shopping_list":
                  resultChat.model = "remove_item";
                  // console.log(response.result.parameters.grocery_list_item_name[0]);
                  if (req.body.list_id) {
                    ShoppingList.findById(req.body.list_id).populate('items').exec(function(err, list) {
                      if (err) {
                        console.log(err);
                        res.status(500).json({
                          message: "Internal Server Error: DB error"
                        });
                      } else if (list) {
                        var found = false;
                        list.items.forEach(function(item, ind, array) {
                          // console.log(list.items[i].name);
                          if (item.name.toLowerCase() == response.result.parameters.grocery_list_item_name[0].toLowerCase() && !item.checked) {
                            found = true;
                            var item_id = item._id;
                            ShoppingItem.findById(item_id).exec(function(err, itemFound) {
                              if (err) {
                                console.log(err);
                                res.status(500).json({
                                  message: "Internal Server Error: DB error"
                                });
                              } else if (item) {
                                itemFound.checked = true;
                                itemFound.save(function(err) {
                                  if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                      message: "Internal Server Error: DB error"
                                    });
                                  }
                                });
                              }
                            });
                          }
                          if (ind == array.length - 1) {
                            var itemName = response.result.parameters.grocery_list_item_name[0].charAt(0).toUpperCase() + response.result.parameters.grocery_list_item_name[0].slice(1);
                            if (found) {
                              resultChat.text = itemName + "? Consider it done!";
                              res.status(200).json(resultChat);
                            } else {
                              resultChat.text = "I couldn't find any " + itemName + " to check on your list!";
                              res.status(200).json(resultChat)
                            }
                          }
                        });
                      } else {
                        resultChat.text = "Hey " + user.name + ", you don't have a list yet!";
                        res.status(200).json(resultChat);
                      }
                    });
                  } else {
                    resultChat.text = "Hey " + user.name + ", activete food section first!";
                    res.status(200).json(resultChat);
                  }
                  break;
                case "info_list":
                  resultChat.text = response.result.fulfillment.messages[0].speech;
                  res.status(200).json(resultChat);
                  break;
                case "need_action":
                  resultChat.model = "need_action";
									console.log(req.body);
                  if (req.body.lat != 0 && req.body.long != 0) {
                    var UserNeed = new Need();
                    UserNeed.user_sender = user;
                    UserNeed.name = response.result.parameters.need_subject;
                    UserNeed.description = "";
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
                                });
                                apnProvider2.send(note, deviceToken).then((result) => {
                                  var status = "";
                                  if (result.sent.length > 0) {
                                    status = "SENT";
                                  } else {
                                    status = "FAILED";
                                  }
                                  console.log("[" + date + "][PUSH NOTIFICATION][prod][" + status + "][" + nearUser.mail + "]");
                                });
                                resultChat.text = response.result.fulfillment.messages[0].speech + " " + nearUser.name + ".";
                                resultChat.obj = UserNeed;
                                res.status(200).json(resultChat);
                              }
                            });
                          } else {
                            resultChat.text = "Sorry " + user.name + ", I can't find available pepole!";
                            res.status(200).json(resultChat);
                          }
                        });
                      } else {
                        resultChat.text = "Sorry " + user.name + ", I can't find available pepole!";
                        res.status(200).json(resultChat);
                      }
                    });
                  } else {
                    esultChat.text = "Hey " + user.name + ", activete needs section first!";
                    res.status(200).json(resultChat);
                  }
                  break;
                case "remind_grocery_shopping": //NSFW
                  resultChat.text = "Sorry " + user.name + ", I'm not sure how to help with that.";
                  res.status(200).json(resultChat);
                  break;
                default:
                  // DEFAULT FALLBACK RESPONSES (RANDOM)
                  resultChat.text = response.result.fulfillment.messages[0].speech;
                  res.status(200).json(resultChat);
              }
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
