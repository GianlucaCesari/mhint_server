//  user_router.js

//  require modules
var express = require('express');

//  require mongoose models
var UserPosition = require('../models/user_position');
var Contact = require('../models/contact');
var User = require('../models/user');

//  router init
var router = express.Router();

router.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	console.log('user_router...');
	next();
});

//  REST User
//  GET ALL USERS
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

// GET USER By ID
router.route('/user/:user_id').get(function(req, res) {
	User.findById(req.params.user_id).populate({path:'positions', options:{limit:2, sort: {'created_at': -1} }}).exec(function(err, user) {
		if (err) {
			res.send(err);
		} else {
			res.json(user);
		}
	});
});

// POST USER
router.route('/user').post(function(req, res) {
    var user = new User();
		console.log("body is: "+req.body);
    if (req.body.name) {
        user.first_name = req.body.name;
    }
		if (req.body.last_name) {
			user.last_name = req.body.last_name;
		}
		if (req.body.full_name) {
			user.full_name = req.body.full_name;
		}
    if (req.body.birthday) {
        // user.birthday = new Date(req.body.birthday);
				user.birthday = req.body.birthday;
    }
    if (req.body.imageProfile) {
        user.image_profile = req.body.imageProfile;
    }
		if (req.body.device_token) {
			user.device_token = req.body.device_token;
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
        user.sections_enabled = req.body.sectionsEnabled;
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

//  PUT USER By MAIL
router.route('/user').put(function(req, res) {
    if (req.body.mail) {
        User.findOne({
            mail: req.body.mail
        }, function(err, user) {
						if (req.body.name) {
								user.first_name = req.body.name;
						}
						if (req.body.last_name) {
							user.last_name = req.body.last_name;
						}
						if (req.body.full_name) {
							user.full_name = req.body.full_name;
						}
            if (req.body.birthday) {
                // user.birthday = new Date(req.body.birthday);
								user.birthday = req.body.birthday;
            }
            if (req.body.imageProfile) {
                user.image_profile = req.body.imageProfile;
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
                user.sections_enabled = req.body.sectionsEnabled;
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
                        res.json(user);
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

//  DELETE USER By MAIL
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

//  FIND User by MAIL
router.route('/user/find').post(function(req, res) {
    if (req.body.mail) {
        User.find({mail: req.body.mail}).populate('positions').exec(function(err, user) {
					if (err) {
						res.send(err);
					} else {
            res.json(user);
					}
        });
    } else {
        res.json({
            message: "Cannot find user without identifier"
        });
    }
});

//  VERIFY BOT User
router.route('/botverify').post(function(req, res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				user.telegram_chat_id = req.body.chat_id;
				user.save(function(err){
					if (err) {
						res.send(err);
					} else {
						res.json({status: 200, message: "OK"})
					}
				});
			}
		});
	} else {
		res.json({
				message: "Cannot find user without identifier"
		});
	}
});

//  ADD Device Token User
router.route('/deviceverify').post(function(req, res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err, user){
			if (err) {
				res.send(err);
			} else {
				user.device_token = req.body.device_token;
				user.save(function(err){
					if (err) {
						res.send(err);
					} else {
						res.json({status: 200, message: "OK"})
					}
				});
			}
		});
	} else {
		res.json({
				message: "Cannot find user without identifier"
		});
	}
});

//  ADD POSITIONS User
router.route('/userpositions').post(function(req, res){
	if (req.body.mail) {
		User.findOne({mail: req.body.mail}).exec(function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var UserPos = new UserPosition();
				UserPos.position.coordinates = [parseFloat(req.body.lat), parseFloat(req.body.long)];
				UserPos.user_id = user.id;
				UserPosition.findOne({user_id: user.id, is_last: true}).exec(function(err, pos){
					if (err) {
						res.send(err);
					} else {
						if (pos) {
							pos.is_last = false;
							pos.save(function(err){
								if (err) {
									res.send(err);
								} else {
									UserPos.save(function(err){
										if (err) {
											res.send(err);
										} else {
											// user.positions = user.positions || [];
											user.last_position = UserPos;
											user.save(function(err){
												if (err) {
													res.send(err);
												} else {
													res.json({status: 200, message: "OK"});
												}
											});
										}
									});
								}
							});
						} else {
							UserPos.save(function(err){
								if (err) {
									res.send(err);
								} else {
									// user.positions = user.positions || [];
									user.last_position = UserPos;
									user.save(function(err){
										if (err) {
											res.send(err);
										} else {
											res.json({status: 200, message: "OK"});
										}
									});
								}
							});
						}
					}
				});
			}
		});
	} else {
			res.json({
					message: "Cannot find user without identifier"
			});
	}
});

// API AI
router.route('/apiairoute').post(function(req,res){
	// console.log('API AI');
	// console.log(req.route.path);
	// console.log(req);
	res.json(req.body);
});

module.exports = router;
