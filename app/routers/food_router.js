//  food_router.js

//  require modules
var express = require('express');

//  require mongoose models
var UserPreference = require('../models/user_preference');
var Nutriment = require('../models/nutriment');
var Category = require('../models/category');
var Food = require('../models/food');

//  router init
var router = express.Router();

router.use(function(req, res, next){
	console.log('food_router..');
	next();
});

router.route('/foods').post(function(req, res){
	var food = new Food();
	food.name = req.body.name;
	food.img_url = req.body.img_url;
	Category.findOne({name: req.body.category}).exec(function(err, category){
		if (category != null) {
			food.category = category.id;
		} else {
			var newCat = new Category({name: req.body.category});
			newCat.save();
			food.category = newCat.id;
		}
		food.nutriments = [];
		for (i = 0; i < req.body.nutriments.length; i++) {
			var nutriment = new Nutriment(req.body.nutriments[i]);
			food.nutriments[food.nutriments.length] = nutriment;
		}
		food.save(function(err){
			if (err) {
				res.send(err);
			} else {
				res.json({message: "Created", value: food});
			}
		});
	});
});

router.route('/foods').get(function(req, res){
	Food.find().exec(function(err, foods){
		if (err) {
			res.send(err);
		} else {
			res.json(foods);
		}
	});
});

router.route('/foods/:food_id').get(function(req, res){
	Food.findById(req.params.food_id ,function(err, food){
		if (err) {
			res.send(err);
		} else {
			res.json(food);
		}
	});
});

router.route('/foodpreference').get(function(req, res){
	if (req.query.mail) {
		Food.find({user_preference: {$nin: [req.query.mail]}}).exec(function(err, foods){
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

router.route('/foodpreference').post(function(req, res){
	if (req.body.mail) {
		Food.findById(req.body.food_id).exec(function(err, food){
			if (err) {
				res.send(err);
			} else {
				var user_preference = new UserPreference();
				user_preference.user_mail = req.body.mail;
				user_preference.food = req.body.food_id;
				user_preference.type = req.body.type;
				user_preference.save(function(err){
					if (err) {
						res.send(err);
					} else {
						food.user_preference = food.user_preference || [];
						food.user_preference.push(req.body.mail);
						food.save(function(err){
							if (err) {
								res.send(err);
							} else {
								res.json({message: "Created", value: user_preference});
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

router.route('/fooduserpreferences').get(function(req, res){
	if (req.query.mail) {
		if (req.query.type != undefined) {
			UserPreference.find({user_mail: req.query.mail, type: req.query.type}).populate('food').exec(function(err, user_preferences){
				if (err) {
					res.send(err);
				} else {
					res.json(user_preferences);
				}
			});
		} else {
			UserPreference.find({user_mail: req.query.mail}).populate('food').exec(function(err, user_preferences){
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
