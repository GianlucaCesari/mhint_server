//  food_router.js

//  require modules
var express = require('express');
var myToken = "0z1Po89d11REJ";

//  require mongoose models
var Allergenic = require('../models/allergenic');
var Diet = require('../models/diet');
var User = require('../models/user');

//  router init
var router = express.Router();

// ALLERGENS

router.route('/getallergens').get(function(req, res) {
  Allergenic.find({}).exec(function(err, allergens) {
    if (err) {
      res.status(500).json({
        message: "Internal Server Error: DB error"
      });
    } else if (allergens.length > 0) {
      res.status(200).json(allergens);
    } else {
      res.status(404).json({
        message: "Allergens not found"
      });
    }
  });
});

router.route('/postallergens').post(function(req, res) {
  if (req.body.access_token == myToken) {
    for (i = 0; i < req.body.allergens.length; i++) {
      var allergenic = new Allergenic();
      allergenic.name = req.body.allergens[i].name;
      allergenic.img_url = req.body.allergens[i].img_url;
      allergenic.save(function(err) {
        if (err) {
          res.status(500).json({
            message: "Internal Server Error: DB error"
          });
        }
      });
    }
    res.status(201).json({
      message: 'Created'
    });
  } else {
    res.status(401).json({
      message: "Unauthorized: Invalid Access Token"
    });
  }
});

router.route('/userallergens').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).populate('allergens').exec(function(err, user) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        res.status(200).json(user.allergens);
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

router.route('/userallergens').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        var alls = [];
        user.allergens = [];
        user.allergens = req.body.allergens;
        user.save(function(err) {
          if (err) {
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            res.status(200).json({
              message: 'OK'
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

// DIETS

router.route('/getdiets').get(function(req, res) {
  Diet.find({}).exec(function(err, diets) {
    if (err) {
      res.status(500).json({
        message: "Internal Server Error: DB error"
      });
    } else if (diets.length > 0) {
      res.status(200).json(diets);
    } else {
      res.status(404).json({
        message: "Diets not found"
      });
    }
  });
});

router.route('/postdiets').post(function(req, res) {
  if (req.body.access_token == myToken) {
    for (i = 0; i < req.body.diets.length; i++) {
      var diet = new Diet();
      diet.name = req.body.diets[i].name;
      diet.img_url = req.body.diets[i].img_url;
      diet.description = req.body.diets[i].description;
      diet.kcal = req.body.diets[i].kcal;
      diet.save(function(err) {
        if (err) {
          res.status(500).json({
            message: "Internal Server Error: DB error"
          });
        }
      });
    }
    res.status(201).json({
      message: 'Created'
    });
  } else {
    res.status(401).json({
      message: "Unauthorized: Invalid Access Token"
    });
  }
});

router.route('/userdiet').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).populate('diet').exec(function(err, user) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        res.status(200).json(user.diet);
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

router.route('/userdiet').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        Diet.findById(req.body.diet_id).exec(function(err, diet) {
          if (err) {
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else if (diet) {
            user.diet = diet;
            user.save(function(err) {
              if (err) {
                res.status(500).json({
                  message: "Internal Server Error: DB error"
                });
              } else {
                res.status(200).json({
                  message: 'OK'
                });
              }
            });
          } else {
            res.status(404).json({
              message: "Diet not found"
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

module.exports = router;
