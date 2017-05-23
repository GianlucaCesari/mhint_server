var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserPositionSchema = new Schema({
	lat: String,
	long: String,
	created_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('UserPosition', UserPositionSchema);
