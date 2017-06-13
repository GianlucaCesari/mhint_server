var express = require('express');
var apiai = require("api.ai");


//  require mongoose models
var ShoppingList = require('../models/shopping_list');
var ShoppingItem = require('../models/shopping_item');
var WeeklyPlan = require('../models/weekly_plan');
var Recipe = require('../models/recipe');
var Food = require('../models/food');
var User = require('../models/user');


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
								resultChat.models = "food_list";
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
										res.status(500).json({message: "Internal Server Error: DB error"});
									} else if (list) {
										resultChat.obj = list;
										resultChat.text = user.name+", "+response.result.fulfillment.messages[0].speech;
										res.status(200).json(resultChat);
									} else {
										resultChat.text = user.name+", "+response.result.fulfillment.messages[0].speech;
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

                resultChat = response.result.fulfillment.messages[0].speech;
                break;
              case "remind_grocery_shopping": //NSFW

                resultChat = response.result.fulfillment.messages[0].speech;
                break;
              default:
                // DEFAULT FALLBACK RESPONSES (RANDOM)
                resultChat.text = "Sorry "+user.name+", I'm not sure how to help with that.";
								res.status(200).json(resultChat);
            }
          } else {
            // DEFAULT FALLBACK RESPONSES (RANDOM)
            resultChat.text = "Sorry "+user.name+", I'm not sure how to help with that.";
						res.status(200).json(resultChat);
          }
        }).error(function(error) {
					console.log(err);
          res.status(500).json({message: "error", value: error}); //DA VEDERE COME MANDARE AD ANDRE
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
