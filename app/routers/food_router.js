//  food_router.js

//  require modules
var express = require('express');
var myToken = "0z1Po89d11REJ";

//  require mongoose models
var UserPreference = require('../models/user_preference');
var Nutrient = require('../models/nutrient');
var Category = require('../models/category');
var Food = require('../models/food');

//  router init
var router = express.Router();

router.route('/foods').post(function(req, res) {
  if (req.body.access_token == myToken) {
    var food = new Food();
    food.name = req.body.name;
    food.img_url = req.body.img_url;
    Category.findOne({
      name: req.body.category
    }).exec(function(err, category) {
      if (category != null) {
        food.category = category.id;
      } else {
        var newCat = new Category({
          name: req.body.category
        });
        newCat.save();
        food.category = newCat.id;
      }
      food.nutrients = [];
      for (i = 0; i < req.body.nutrients.length; i++) {
        var nutrient = new Nutrient(req.body.nutrients[i]);
        food.nutrients[food.nutrients.length] = nutrient;
      }
      food.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.json({
            message: "Created",
            value: food
          });
        }
      });
    });
  } else {
    res.json({
      message: "invalid access token"
    });
  }
});

router.route('/foods').get(function(req, res) {
  Food.find().exec(function(err, foods) {
    if (err) {
      res.send(err);
    } else {
      res.json(foods);
    }
  });
});

router.route('/foods/:food_id').get(function(req, res) {
  Food.findById(req.params.food_id, function(err, food) {
    if (err) {
      res.send(err);
    } else {
      res.json(food);
    }
  });
});

router.route('/foodpreference').get(function(req, res) {
  if (req.query.mail) {
    Food.findRandom({
      user_preference: {
        $nin: [req.query.mail]
      }
    }).limit(10).exec(function(err, foods) {
      if (err) {
        console.log("ciao");
        res.send(err);
      } else {
        console.log("ok");
        res.json(foods);
      }
    })
  } else {
    res.json({
      message: "Cannot modify user without identifier"
    });
  }
});

router.route('/foodpreference').post(function(req, res) {
  if (req.body.mail) {
    Food.findById(req.body.food_id).exec(function(err, food) {
      if (err) {
        res.send(err);
        console.log("no id");
      } else {
        var user_preference = new UserPreference();
        user_preference.user_mail = req.body.mail;
        user_preference.food = req.body.food_id;
        user_preference.type = req.body.type;
        user_preference.save(function(err) {
          if (err) {
            res.send(err);
            console.log("no pref");
          } else {
            food.user_preference = food.user_preference || [];
            food.user_preference.push(req.body.mail);
            food.save(function(err) {
              if (err) {
                res.send(err);
                console.log("no save");
              } else {
                console.log("ok save");
                res.json({
                  message: "Created",
                  value: user_preference
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

router.route('/fooduserpreferences').get(function(req, res) {
  if (req.query.mail) {
    if (req.query.type != undefined) {
      UserPreference.find({
        user_mail: req.query.mail,
        type: req.query.type
      }).populate('food').exec(function(err, user_preferences) {
        if (err) {
          res.send(err);
        } else {
          res.json(user_preferences);
        }
      });
    } else {
      UserPreference.find({
        user_mail: req.query.mail
      }).populate('food').exec(function(err, user_preferences) {
        if (err) {
          res.send(err);
        } else {
          res.json(user_preferences);
        }
      });
    }
  } else {
    res.json({
      message: "Cannot modify user without identifier"
    });
  }
});

module.exports = router;
