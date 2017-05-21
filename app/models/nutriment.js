var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NutrimentSchema = new Schema({
	name: String,
	unit: String,
	value: Number,
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Nutriment', NutrimentSchema);
