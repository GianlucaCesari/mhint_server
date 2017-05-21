var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Nutriment = require('./nutriment');

var FoodSchema = new Schema({
	name: String,
	category: Schema.Types.ObjectId,
	nutriments: [],
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Food', FoodSchema);
