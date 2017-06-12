//  user_router.js

//  require modules
var express = require('express');

//  require mongoose models
var AuthApplication = require('../models/auth_application');
var UserPosition = require('../models/user_position');
var User = require('../models/user');

//  router init
var router = express.Router();

//  REST User
//  GET ALL USERS
router.route('/user').get(function(req, res) {
  User.find({}).exec(function(err, users) {
    if (err) {
      console.log(err);
      res.json({
        status: 500,
        message: "Internal Server Error: DB error"
      });
    } else {
      res.json({
        status: 200,
        message: "OK",
        value: users
      });
    }
  });
});

// POST USER
router.route('/user').post(function(req, res) {
  var user;
  User.findOne({
    mail: req.body.mail
  }).exec(function(err, userFound) {
    if (err) {
      console.log(err);
      res.json({
        status: 500,
        message: "Internal Server Error: DB error"
      });
    } else if (userFound) {
      user = userFound;
    } else {
      user = new User();
    }
    user.name = req.body.name;
    if (req.body.last_name) {
      user.last_name = req.body.last_name;
    }
    if (req.body.birthday) {
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

    user.save(function(err) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        })
      } else {
        res.json({
          status: 201,
          message: "Created",
          value: user
        });
      }
    });
  });
});

//  PUT USER By MAIL
router.route('/user').put(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }, function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        if (req.body.name) {
          user.name = req.body.name;
        }
        if (req.body.last_name) {
          user.last_name = req.body.last_name;
        }
        if (req.body.birthday) {
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
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.json({
              status: 500,
              message: "Internal Server Error: DB error"
            });
          } else {
            res.json(user);
          }
        });
      } else {
        res.json({
          status: 404,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Missing parameters"
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
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        });
      } else {
        res.json({
          status: 200,
          message: "OK"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Bad Request"
    });
  }
});

//  FIND User by MAIL
router.route('/user/find').post(function(req, res) {
  if (req.body.mail) {
    User.find({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        })
      } else if (user != null && user != undefined) {
        res.json({
          status: 200,
          message: "OK",
          value: user
        });
      } else {
        res.json({
          status: 404,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Missing parameters"
    });
  }
});

//  VERIFY BOT User
router.route('/botverify').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        user.telegram_chat_id = req.body.chat_id;
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.json({
              status: 500,
              message: "Internal Server Error: DB error"
            });
          } else {
            res.json({
              status: 200,
              message: "OK"
            });
          }
        });
      } else {
        res.json({
          status: 404,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Missing parameters"
    });
  }
});

//  ADD Device Token User
router.route('/deviceverify').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        user.device_token = req.body.device_token;
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.json({
              status: 500,
              message: "Internal Server Error: DB error"
            });
          } else {
            res.json({
              status: 200,
              message: "OK"
            });
          }
        });
      } else {
        res.json({
          status: 404,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Missing parameters"
    });
  }
});

//  ADD POSITIONS User
router.route('/userpositions').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        var UserPos = new UserPosition();
        UserPos.position.coordinates = [parseFloat(req.body.lat), parseFloat(req.body.long)];
        UserPos.display_position.lat = parseFloat(req.body.lat);
        UserPos.display_position.long = parseFloat(req.body.long);
        UserPos.user_id = user.id;
        UserPosition.findOne({
          user_id: user.id,
          is_last: true
        }).exec(function(err, pos) {
          if (err) {
            console.log(err);
            res.json({
              status: 500,
              message: "Internal Server Error: DB error"
            });
          } else {
            if (pos) {
              pos.is_last = false;
              pos.save(function(err) {
                if (err) {
                  console.log(err);
                  res.json({
                    status: 500,
                    message: "Internal Server Error: DB error"
                  });
                } else {
                  UserPos.save(function(err) {
                    if (err) {
                      console.log(err);
                      res.json({
                        status: 500,
                        message: "Internal Server Error: DB error"
                      });
                    } else {
                      user.last_position = UserPos;
                      user.save(function(err) {
                        if (err) {
                          console.log(err);
                          res.json({
                            status: 500,
                            message: "Internal Server Error: DB error"
                          });
                        } else {
                          res.json({
                            status: 200,
                            message: "OK"
                          });
                        }
                      });
                    }
                  });
                }
              });
            } else {
              UserPos.save(function(err) {
                if (err) {
                  console.log(err);
                  res.json({
                    status: 500,
                    message: "Internal Server Error: DB error"
                  });
                } else {
                  user.last_position = UserPos;
                  user.save(function(err) {
                    if (err) {
                      res.send(err);
                    } else {
                      res.json({
                        status: 200,
                        message: "OK"
                      });
                    }
                  });
                }
              });
            }
          }
        });
      } else {
        res.json({
          status: 404,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Missing parameters"
    });
  }
});

router.route('/apikey').post(function(req, res) {
  if (req.body.mail) {
    User.findOne({
      mail: req.body.mail
    }).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.json({
          status: 500,
          message: "Internal Server Error: DB error"
        });
      } else if (user) {
        var app = new AuthApplication();
        app.app_name = req.body.app_name;
        app.owner = user;
        app.save(function(err) {
          if (err) {
            console.log(err);
            res.json({
              status: 500,
              message: "Internal Server Error: DB error"
            });
          } else {
            res.json({
              status: 201,
              message: "Created",
              value: app.api_key
            });
          }
        });
      } else {
        res.json({
          status: 404,
          message: "User not found"
        });
      }
    });
  } else {
    res.json({
      status: 400,
      message: "Missing parameters"
    });
  }
});

module.exports = router;
