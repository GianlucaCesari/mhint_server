var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var unirest = require('unirest');
var mongoose = require('mongoose');
var User = require('./models/user');
var Contact = require('./models/contact');
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

// app.post('/random', function(req, res) {
//     console.log("request:::::::::", req.body);
//     unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?limitLicense=false&number=1&tags=vegetarian%2Cdessert")
//         .header("X-Mashape-Key", "C7zHMmU1oOmshSgRlGXXb0EEsmlrp1YA9akjsnqOtsmr8oWtcG")
//         .header("Accept", "application/json")
//         .end(function(result) {
//             console.log("RESULT IS::::::" + result.body.instructions);
//             var speech = result.body.instructions
//             console.log("SPEECH IS" + speech);
//             var bodyForApiAi = {
//                 speech : speech,
//                 displayText : speech
//             }
//             console.log("PER API AI::::", bodyForApiAi);
//             res.json({
//                 speech : "The "+result.body.recipes[0].dishTypes+" i found is called " + result.body.recipes[0].title + ". It's pretty easy : " + result.body.recipes[0].instructions,
//                 displayText : "The "+result.body.recipes[0].dishTypes+" i found is called " + result.body.recipes[0].title + ". It's pretty easy : " + result.body.recipes[0].instructions
//             });
//         });
// })

app.listen(port);
console.log('Server started on port ' + port);
