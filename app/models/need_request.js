var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

var NeedRequestSchema = new Schema({
	user_receiver: {type: Schema.Types.ObjectId, ref: 'User'},
	user_sender: {type: Schema.Types.ObjectId, ref: 'User'},
	status: {
		type: String,
		default: "pending"
	},
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('NeedRequest', NeedRequestSchema);
