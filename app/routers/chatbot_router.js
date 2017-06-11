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
            nlp.text(req.body.chat, {sessionId: req.body.mail})
                .then(function(response) {
                    console.log(response);
                    var resultChat;
                    //CHECK VALIDITY OF QUERY
                    if (response.result.score > 0.6) {
                        //CHOOSE THE RIGHT ACTION
                        switch (response.result.action) {
                            case "show_grocery_list":
                                    resultChat = response.result.fulfillment.messages[0].speech;
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
                                resultChat = "I'm not sure how to help with that."
                        }
                    } else {
                        // DEFAULT FALLBACK RESPONSES (RANDOM)
                        resultChat = "I'm not sure how to help with that."
                    }
                    res.json(resultChat); //DA VEDERE COME MANDARE AD ANDRE
                })
                .error(function(error) {
                    res.json(error); //DA VEDERE COME MANDARE AD ANDRE 
                });
        } else {

        }
});

module.exports = router;
