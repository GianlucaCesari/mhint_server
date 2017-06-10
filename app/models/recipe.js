var mongoose = require('mongoose');
var random = require('mongoose-random');
var Schema = mongoose.Schema;

var Nutrient = require('./nutrient');
var Food = require('./food');

var RecipeSchema = new Schema({
	spoon_id: Number,
	title: String,
	minutes: Number,
	instructions: String,
	steps: [],
	caloric_breakdown: {},
	ingredients: [{
		food: {type: Schema.Types.ObjectId, ref: 'Food'},
		amount: Number,
		unit: String
	}],
	img_url: String,
	nutrients: [],
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

RecipeSchema.plugin(random, { path: 'r' });

module.exports = mongoose.model('Recipe', RecipeSchema);
