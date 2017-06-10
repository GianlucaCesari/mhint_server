var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserPosition = require('./user_position');
var Allergenic = require('./allergenic');
var Diet = require('./diet');

var UserSchema = new Schema({
    name: String,
		last_name: String,
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
    tel_number: String,
		allergens: [{type: Schema.Types.ObjectId, ref: 'Allergenic'}],
		diet: {type: Schema.Types.ObjectId, ref: 'Diet'},
    contacts: [],
		last_position: {type: Schema.Types.ObjectId, ref: 'UserPosition'},
		created_at: Date,
		updated_at: Date
});

UserSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
