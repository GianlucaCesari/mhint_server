var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    birthday: Date,
    imageProfile: String,
    address: String,
    height: Number,
    weight: Number,
    lifestyle: Number,
    sex: {
        type: Number,
        max: 3
    },
    sectionsEnabled: {
        food: {
            type: Boolean,
            default: false
        },
        need: {
            type: Boolean,
            default: false
        }
    },
    logins: {
        facebook: {
            type: Boolean,
            default: false
        },
        twitter: {
            type: Boolean,
            default: false
        },
        google: {
            type: Boolean,
            default: false
        },
        health: {
            type: Boolean,
            default: false
        }
    },
    mail: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);
