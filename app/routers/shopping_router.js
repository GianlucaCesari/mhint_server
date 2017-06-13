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
router.route('/shoppinglist').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
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
          } else {
            res.status(200).json(list);
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

// post ShoppingList
router.route('/shoppinglist').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        var shoppingList = new ShoppingList();
        shoppingList.user = user._id;
        shoppingList.title = req.body.title;
        shoppingList.items = [];
        for (i = 0; i < req.body.items.length; i++) {
          var shoppingItem = new ShoppingItem();
          shoppingItem.name = req.body.items[i].name;
          if (req.body.items[i].value) {
            shoppingItem.value = req.body.items[i].value;
          }
          if (req.body.items[i].unit) {
            shoppingItem.unit = req.body.items[i].unit;
          }
          shoppingItem.save();
          shoppingList.items.push(shoppingItem);
        }
        shoppingList.save(function(err) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            res.status(201).json({
              message: "Created",
              value: shoppingList
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

// complete list
router.route('/listcomplete').post(function(req, res) {
  if (req.body.list_id) {
    ShoppingList.findById(req.body.list_id).exec(function(err, list) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (list) {
        list.completed = true;
        list.completed_at = new Date();
        list.save(function(err) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            res.status(200).json({
              message: "OK"
            });
          }
        });
      } else {
        res.status(404).json({
          message: "List not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

// complete item
router.route('/itemchecked').post(function(req, res) {
  if (req.body.item_id) {
    ShoppingItem.findById(req.body.item_id).exec(function(err, item) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (item) {
        item.checked = req.body.checked;
        item.save(function(err) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            res.status(200).json({
              message: "OK",
              value: item
            });
          }
        });
      } else {
        res.status(404).json({
          message: "Item not found"
        });
      }
    });
  } else {
    res.status(400).json({
      message: "Missing parameters"
    });
  }
});

// add item
router.route('/additem').post(function(req, res) {
  if (req.body.list_id) {
    ShoppingList.findById(req.body.list_id).exec(function(err, list) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (list) {
        var item = new ShoppingItem();
        item.name = req.body.item.name;
        if (req.body.item.value) {
          item.value = req.body.item.value;
        }
        if (req.body.item.unit) {
          item.unit = req.body.item.unit;
        }
        item.save();
        list.items.push(item);
        list.save(function(err) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          } else {
            res.status(200).json(list);
          }
        });
      } else {
        res.status(404).json({
          message: "List not found"
        });
      }
    });
  } else if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        var shoppingList = new ShoppingList();
        shoppingList.user = user._id;
        shoppingList.title = req.body.title;
        shoppingList.items = [];
        var item = new ShoppingItem();
        item.name = req.body.item.name;
        if (req.body.item.value) {
          item.value = req.body.item.value;
        }
        if (req.body.item.unit) {
          item.unit = req.body.item.unit;
        }
        item.save();
        shoppingList.items.push(item);
        shoppingList.save(function(err) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "Internal Server Error: DB error"
            });
          }
        });
        res.status(201).json(shoppingList);
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
