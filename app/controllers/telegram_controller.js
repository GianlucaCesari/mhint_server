//  telegram_controller.js

module.exports = {
  init: function() {
    //  require modules
    var telegramBot = require('node-telegram-bot-api');
    var apiai = require("api.ai");
    var apn = require('apn');

    //require mongoose models
    var ShoppingList = require('../models/shopping_list');
    var ShoppingItem = require('../models/shopping_item');
		var UserPosition = require('../models/user_position');
		var Need = require('../models/need');
    var User = require('../models/user');

    var token = '330058876:AAGnelPoLMBjRuWiuQiFrkTENe54booDYrE';
    var bot = new telegramBot(token, {
      polling: true
    });

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

    bot.on('message', (msg) => {
      // console.log(msg);
      var chatId = msg.chat.id;
      var telegram_id = msg.from.id;
      var responseMsg = "Error";

      if (msg.text === "/start") {
        responseMsg = "Hi " + msg.from.first_name + ", this is your code to insert into the Mhint app: " + telegram_id;
        bot.sendMessage(chatId, responseMsg);
      } else {
        User.findOne({
          telegram_chat_id: telegram_id
        }).populate('last_position').exec(function(err, user) {
          if (err) {
            console.log(err);
            bot.sendMessage(chatId, responseMsg);
          } else if (user) {
            var nlp = new apiai({
              token: "fb6d48f1ebf04969b8791576731e4f5b",
              session: user.mail
            });
            nlp.text(msg.text, {
              sessionId: user.mail
            }).then(function(response) {
              // console.log(response.result);
              if (response.result.score > 0.6) {
                if (response.result.actionIncomplete) {
                  responseMsg = response.result.fulfillment.messages[0].speech;
                  bot.sendMessage(chatId, responseMsg);
                } else {
                  switch (response.result.action) {
                    case "input.welcome":
                      responseMsg = response.result.fulfillment.messages[0].speech;
                      bot.sendMessage(chatId, responseMsg);
                      break;
                    case 'check_recipe':
                      responseMsg = "Sorry " + user.name + ", I can't help you with that... yet!";
                      bot.sendMessage(chatId, responseMsg);
                      break;
                    case "remove_from_shopping_list":
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
                          bot.sendMessage(chatId, responseMsg);
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
                                  bot.sendMessage(chatId, responseMsg);
                                } else if (item) {
                                  itemFound.checked = true;
                                  itemFound.save(function(err) {
                                    if (err) {
                                      console.log(err);
                                      bot.sendMessage(chatId, responseMsg);
                                    }
                                  });
                                }
                              });
                            }
                            if (ind == array.length - 1) {
                              var itemName = response.result.parameters.grocery_list_item_name[0].charAt(0).toUpperCase() + response.result.parameters.grocery_list_item_name[0].slice(1);
                              if (found) {
                                responseMsg = itemName + "? Consider it done!";
                                bot.sendMessage(chatId, responseMsg);
                              } else {
                                responseMsg = "I couldn't find any " + itemName + " to check on your list!";
                                bot.sendMessage(chatId, responseMsg);
                              }
                            }
                          });
                        } else {
                          responseMsg = "Sorry " + user.name + ", I can't find your list.";
                          bot.sendMessage(chatId, responseMsg);
                        }
                      });
                      break;
                    case "show_grocery_list":
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
                          bot.sendMessage(chatId, responseMsg);
                        } else if (list) {
                          var itemFound;
                          if (response.result.parameters.grocery_list_item_name.length > 0) {
                            list.items.forEach(function(item, ind, array) {
                              if (item.name.toLowerCase() == response.result.parameters.grocery_list_item_name[0].toLowerCase()) {
                                itemFound = item;
                              }
                              if (ind == array.length - 1) {
                                if (itemFound) {
                                  var itemName = itemFound.name.charAt(0).toUpperCase() + itemFound.name.slice(1);
                                  if (!itemFound.checked) {
                                    responseMsg = "Yes, I found " + itemName + " in your list.";
                                    bot.sendMessage(chatId, responseMsg);
                                  } else {
                                    responseMsg = user.name + ", I think you've already bought " + itemName;
                                    bot.sendMessage(chatId, responseMsg);
                                  }
                                } else {
                                  var name = response.result.parameters.grocery_list_item_name[0].charAt(0).toUpperCase() + response.result.parameters.grocery_list_item_name[0].slice(1);
                                  responseMsg = "I can't find any " + name + " on your list!";
                                  bot.sendMessage(chatId, responseMsg);
                                }
                              }
                            });
                          } else {
                            responseMsg = user.name + ", " + response.result.fulfillment.messages[0].speech;
                            bot.sendMessage(chatId, responseMsg);
														list.items.forEach(function(item, ind, array) {
															console.log(item);
															var responseMsg = item.name + "   " + item.value ? item.value : "" + " " + item.unit ? item.unit : "";
															bot.sendMessage(chatId, responseMsg)
														});
                          }
                        } else {
                          responseMsg = "Sorry " + user.name + ", I can't find your list.";
                          bot.sendMessage(chatId, responseMsg);
                        }
                      });
                      break;
                    case "add_grocery_list":
                      ShoppingList.findOne({
                        user: user._id,
                        completed: false
                      }, {}, {
                        sort: {
                          'created_at': -1
                        }
                      }).exec(function(err, list) {
                        if (err) {
                          console.log(err);
                          bot.sendMessage(chatId, responseMsg);
                        } else if (list) {
                          ShoppingList.findOne({
                            user: user._id,
                            completed: false
                          }, {}, {
                            sort: {
                              'created_at': -1
                            }
                          }).populate('items').exec(function(err, list) {
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
                                  bot.sendMessage(chatId, responseMsg);
                                } else {
                                  list.items.push(item);
                                  if (response.result.parameters.grocery_list_item_name.length > 1) {
                                    item2.save(function(err) {
                                      if (err) {
                                        console.log(err);
                                        bot.sendMessage(chatId, responseMsg);
                                      } else {
                                        list.items.push(item2);
                                        list.save(function(err) {
                                          if (err) {
                                            console.log(err);
                                            bot.sendMessage(chatId, responseMsg);
                                          } else {
                                            responseMsg = response.result.fulfillment.messages[0].speech;
                                            bot.sendMessage(chatId, responseMsg);
                                          }
                                        });
                                      }
                                    });
                                  } else {
                                    list.save(function(err) {
                                      if (err) {
                                        console.log(err);
                                        bot.sendMessage(chatId, responseMsg);
                                      } else {
                                        responseMsg = response.result.fulfillment.messages[0].speech;
                                        bot.sendMessage(chatId, responseMsg);
                                      }
                                    });
                                  }
                                }
                              });
                            } else {
                              responseMsg = "Sorry, I can't add more than two items per time";
                              bot.sendMessage(chatId, responseMsg);
                            }
                          });
                        } else {
                          responseMsg = "Sorry " + user.name + ", I can't find your list.";
                          bot.sendMessage(chatId, responseMsg);
                        }
                      });
                      break;
                    case "need_action":
											if (user.last_position) {
                      var UserNeed = new Need();
                      UserNeed.user_sender = user;
                      UserNeed.name = response.result.parameters.need_subject;
                      UserNeed.description = "";
                      // var needCoordinates = [parseFloat(req.body.lat), parseFloat(req.body.long)];
                      UserNeed.display_position.lat = user.last_position.position.coordinates[0];
                      UserNeed.display_position.long = user.last_position.position.coordinates[1];
                      UserNeed.request_position.coordinates = user.last_position.position.coordinates;
                      var last24h = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
                      UserPosition.findOne({
                        is_last: true,
                        position: {
                          $geoNear: {
                            type: "Point",
                            coordinates: user.last_position.position.coordinates
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
													bot.sendMessage(chatId, responseMsg);
                        } else if (pos) {
                          User.findById(pos.user_id).exec(function(err, nearUser) {
                            if (err) {
															console.log(err);
															bot.sendMessage(chatId, responseMsg);
                            } else if (nearUser) {
                              UserNeed.user_receiver = nearUser;
                              UserNeed.save(function(err) {
                                if (err) {
																	console.log(err);
																	bot.sendMessage(chatId, responseMsg);
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
                                  responseMsg = response.result.fulfillment.messages[0].speech + " " + nearUser.name + ".";
                                  bot.sendMessage(chatId, responseMsg);
                                }
                              });
                            } else {
                              responseMsg = "Sorry " + user.name + ", I can't find anybody available right now!";
                              bot.sendMessage(chatId, responseMsg);
                            }
                          });
                        } else {
                          rresponseMsg = "Sorry " + user.name + ", I can't find anybody available right now!";
                          bot.sendMessage(chatId, responseMsg);
                        }
                      });
										} else {
											responseMsg = "Sorry " + user.name + ", I can't help you with that without your position.";
                      bot.sendMessage(chatId, responseMsg);
										}
                      break;
                    default:
                      responseMsg = response.result.fulfillment.messages[0].speech;
                      bot.sendMessage(chatId, responseMsg);
                  }
                }
              } else {
                responseMsg = "Sorry " + user.name + ", I'm not sure how to help with that.";
                bot.sendMessage(chatId, responseMsg);
              }
            });
          } else {
            responseMsg = "Sorry " + msg.from.first_name + ", I don't know you, what about you go to settings in the Mhint app?";
            bot.sendMessage(chatId, responseMsg);
          }
        });
      }
      // bot.sendMessage(chatId, response);
    });
    console.log("start telegram bot...");
  }
};
