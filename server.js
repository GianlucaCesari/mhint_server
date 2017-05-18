var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./models/user');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/Mhint');

var port = 3000;

// USER LIST
app.get('/user', function(req, res) {
    User.find({}, function(err, users) {
        var userMap = {};
        users.forEach(function(user) {
            userMap[user._id] = user;
        });
        console.log(userMap);
        res.send(userMap);
    });
});

//USER FIND
app.post('/user/find', function(req, res) {
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

//CREATE USER
app.post('/user', function(req, res) {
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

//UPDATE USER

app.put('/user', function(req, res) {
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



//DELETE USER
app.delete('/user', function(req, res) {
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

app.listen(port);
console.log('Server started on port ' + port);
