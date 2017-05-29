var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NutrientSchema = new Schema({
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

module.exports = mongoose.model('Nutrient', NutrientSchema);
