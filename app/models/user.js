var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var Contact = require('./contact');
var UserPosition = require('./user_position');

var UserSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    birthday: String,
		telegram_chat_id: String,
    image_profile: String,
		device_token: String,
    address: String,
    height: Number,
    weight: Number,
    lifestyle: Number,
    sex: {
        type: Number,
        max: 3
    },
    sections_enabled: {
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
    },
    prefix : String,
    tel_number: Number,
    contacts: [],
		last_position: {type: Schema.Types.ObjectId, ref: 'UserPosition'},
		created_at: {
			type: Date,
			default: Date.now()
		},
		updated_at: {
			type: Date,
			default: Date.now()
		}
});

module.exports = mongoose.model('User', UserSchema);
