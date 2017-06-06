var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AllergenicSchema = new Schema({
	name: String,
	img_url: String,
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Allergenic', AllergenicSchema);
