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
  Allergenic.find({}).exec(function(err, allergens){
		if (err) {
			res.send(err);
		} else {
			res.json(allergens);
		}
	});
});

router.route('/postallergens').post(function(req, res) {
	if (req.body.access_token == myToken) {
		for (i = 0; i < req.body.allergens.length; i++) {
			var allergenic = new Allergenic();
			allergenic.name = req.body.allergens[i].name;
			allergenic.img_url = req.body.allergens[i].img_url;
			allergenic.save(function(err){
				if (err) {
					res.send(err);
				}
			});
		}
		res.json({status: 200, message: 'OK'});
	} else {
		res.json({
      message: "invalid access token"
    });
	}
});

router.route('/userallergens').get(function(req, res){
	if (req.query.mail) {
		User.findOne({mail: req.query.mail}).populate('allergens').exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				res.json(user.allergens);
			}
		});
	} else {
		res.json({
      message: "Cannot modify user without identifier"
    });
	}
});

router.route('/userallergens').post(function(req, res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				user.allergens = [];
				for (i = 0; i < req.body.allergens.length; i++) {
					Allergenic.findById(req.body.allergens[i]).exec(function(err, all){
						if (err) {
							res.send(err);
						} else {
							user.allergens.push(all);
						}
					});
				}
				user.save(function(err){
					if (err) {
						res.send(err);
					} else {
						res.json({status: 200, message: 'OK'});
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

// DIETS

router.route('/getdiet').get(function(req, res){
	Diet.find({}).exec(function(err, diets){
		if (err) {
			res.send(err);
		} else {
			res.json(diets);
		}
	});
});

router.route('/postdiet').post(function(req, res){
	if (req.body.access_token == myToken) {
		for (i = 0; i < req.body.diets.length; i++) {
			var diet = new Diet();
			diet.name = req.body.diets[i].name;
			diet.img_url = req.body.diets[i].img_url;
			diet.save(function(err){
				if (err) {
					res.send(err);
				}
			});
		}
		res.json({status: 200, message: 'OK'});
	} else {
		res.json({
      message: "invalid access token"
    });
	}
});

router.route('/userdiet').get(function(req, res){
	if (req.query.mail) {
		User.findOne({mail: req.query.mail}).populate('diet').exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				res.json(user.diet);
			}
		});
	} else {
		res.json({
      message: "Cannot modify user without identifier"
    });
	}
});

router.route('/userdiet').post(function(req, res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				Diet.findById(req.body.diet_id).exec(function(err, diet){
					if (err) {
						res.send(err);
					} else {
						user.diet = diet;
						user.save(function(err){
							if (err) {
								res.send(err);
							} else {
								res.json({status: 200, message: 'OK'});
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

module.exports = router;
