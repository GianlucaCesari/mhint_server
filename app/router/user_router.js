//  user_router.js

//  require modules
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');

//  require mongoose models
var Contact = require('../models/contact');
var User = require('../models/user');

//  router init
var router = express.Router();

router.use(function(req, res, next){
	console.log('user_router...');
	next();
});

//  REST User
router.route('/user').get(function(req, res) {
    User.find({}, function(err, users) {
        var userMap = {};
        users.forEach(function(user) {
            userMap[user._id] = user;
        });
        console.log(userMap);
        res.send(userMap);
    });
});

router.route('/user').post(function(req, res) {
    var user = new User();
    if (req.body.name) {
        user.name = req.body.name;
    }
    if (req.body.birthday) {
        user.birthday = new Date(req.body.birthday);
    }
    if (req.body.imageProfile) {
        user.imageProfile = req.body.imageProfile;
    }
    if (req.body.address) {
        user.address = req.body.address;
    }
    if (req.body.height) {
        user.height = req.body.height;
    }
    if (req.body.weight) {
        user.weight = req.body.weight;
    }
    if (req.body.lifestyle) {
        user.lifestyle = req.body.lifestyle;
    }
    if (req.body.sex) {
        user.sex = req.body.sex;
    }
    if (req.body.sectionsEnabled) {
        user.sectionsEnabled = req.body.sectionsEnabled;
    }
    if (req.body.logins) {
        user.logins = req.body.logins;
    }
    if (req.body.mail) {
        user.mail = req.body.mail;
    }
    if (req.body.password) {
        user.password = req.body.password;
    }
    if (req.body.prefix) {
        user.prefix = req.body.prefix;
    }
    if (req.body.tel_number) {
        user.tel_number = req.body.tel_number;
    }
    if (req.body.contacts) {
        var contactsArray = [];
        for (var contact in req.body.contacts) {
            var contact = new Contact()
            contact.name = req.body.contacts.name;
            contact.prefix = req.body.contacts.prefix;
            contact.tel_number = req.body.contacts.tel_number;
            contactsArray.push(contact);
        }
        user.contacts = contactsArray;
    }

    user.save(function(err) {
        if (err) {
            if (err.code == 11000) {
                res.json({
                    message: "User already existing"
                })
            } else {
                res.send(err);
            }
        } else {
            console.log(user);
            res.json({
                message: "Created",
                value: user
            });
        }
    });
});

router.route('/user').put(function(req, res) {
    if (req.body.mail) {
        User.findOne({
            mail: req.body.mail
        }, function(err, user) {
            if (req.body.name) {
                user.name = req.body.name;
            }
            if (req.body.birthday) {
                user.birthday = new Date(req.body.birthday);
            }
            if (req.body.imageProfile) {
                user.imageProfile = req.body.imageProfile;
            }
            if (req.body.address) {
                user.address = req.body.address;
            }
            if (req.body.height) {
                user.height = req.body.height;
            }
            if (req.body.weight) {
                user.weight = req.body.weight;
            }
            if (req.body.lifestyle) {
                user.lifestyle = req.body.lifestyle;
            }
            if (req.body.sex) {
                user.sex = req.body.sex;
            }
            if (req.body.sectionsEnabled) {
                user.sectionsEnabled = req.body.sectionsEnabled;
            }
            if (req.body.logins) {
                user.logins = req.body.logins;
            }
            if (req.body.mail) {
                user.mail = req.body.mail;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.prefix) {
                user.prefix = req.body.prefix;
            }
            if (req.body.tel_number) {
                user.tel_number = req.body.tel_number;
            }
            if (req.body.contacts) {
                user.contacts = req.body.contacts;
            }
            user.save(function(err) {
                if (err) {
                    console.error('ERROR!');
                } else {
                    User.find({
                        mail: req.body.mail
                    }, function(err, user) {
                        console.log(user);
                        res.send(user);
                    });
                }
            });
        });
    } else {
        res.json({
            message: "Cannot modify user without identifier"
        });
    }
});

router.route('/user').delete(function(req, res) {
    if (req.body.mail) {
        User.remove({
            mail: req.body.mail
        }, function(err) {
            if (err) {
                res.json({
                    message: "User could not be removed"
                });
            } else {
                res.json({
                    message: "User succesfully removed"
                });
            }
        });
    } else {
        res.json({
            message: "Cannot delete without identifier"
        });
    }
});

//  FIND User
router.route('/user/find').post(function(req, res) {
    if (req.body.mail) {
        User.find({
            mail: req.body.mail
        }, function(err, user) {
            console.log(user);
            res.send(user);
        });
    } else {
        res.json({
            message: "Cannot find user without identifier"
        });
    }
});

module.exports = router;
