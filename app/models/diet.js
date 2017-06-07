var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DietSchema = new Schema({
	name: String,
	img_url: String,
	description: String,
	kcal: String,
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Diet', DietSchema);