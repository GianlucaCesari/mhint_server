var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');
var UserPosition = require('./user_position');

var NeedSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	request_position: {type: Schema.Types.ObjectId, ref: 'UserPosition'},
	name: String,
	description: String,
	type: String,
	target_users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Need', NeedSchema);
