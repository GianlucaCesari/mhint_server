var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

var NeedRequestSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	accept: {
		type: Boolean,
		default: false
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
