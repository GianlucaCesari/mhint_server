//  shopping_router.js

//  require modules
var express = require('express');

//  require mongoose models
var ShoppingList = require('../models/shopping_list');
var ShoppingItem = require('../models/shopping_item');
var User = require('../models/user');

//  router init
var router = express.Router();

// get ShoppingList
router.route('/shoppinglist').get(function(req,res){
	if (req.query.mail) {
		User.findOne({mail: req.query.mail}).exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				ShoppingList.findOne({user: user._id}, {}, { sort: { 'created_at' : -1 } }).populate('items').exec(function(err,list){
					if (err) {
						res.send(err);
					} else {
						res.json(list);
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

// post ShoppingList
router.route('/shoppinglist').post(function(req,res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				var shoppingList = new ShoppingList();
				shoppingList.user = user;
				shoppingList.title = req.body.title;
				shoppingList.items = [];
				for (i = 0; i < req.body.items.length; i++) {
					var shoppingItem = new ShoppingItem();
					shoppingItem.name = req.body.items[i].name;
					shoppingItem.value = req.body.items[i].value;
					shoppingItem.unit = req.body.items[i].unit;
					shoppingItem.save();
					shoppingList.items.push(shoppingItem);
				}
				shoppingList.save(function(err){
					if (err) {
						res.send(err);
					} else {
						res.json({status: 200, message: "OK"});
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

// complete item
router.route('/itemchecked').post(function(req,res){
	ShoppingItem.findById(req.body.item_id).exec(function(err, item){
		if (err) {
			res.send(err);
		} else {
			item.checked = req.body.checked;
			item.save(function(err){
				if (err) {
					res.send(err);
				} else {
					res.json(item);
				}
			});
		}
	});
});

// add item
router.route('/additem').post(function(req,res){
	ShoppingList.findById(req.body.list_id).exec(function(err, list){
		if (err) {
			res.send(err);
		} else {
			var item = new ShoppingItem();
			item.name = req.body.item.name;
			item.value = req.body.item.value;
			item.unit = req.body.item.unit;
			item.save();
			list.items.push(item);
			list.save(function(err){
				if (err) {
					res.send(err);
				} else {
					res.json(list);
				}
			});
		}
	});
});

module.exports = router;
