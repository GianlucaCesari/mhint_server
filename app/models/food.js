var mongoose = require('mongoose');
var random = require('mongoose-random');
var Schema = mongoose.Schema;

var Nutrient = require('./nutrient');
var Category = require('./category');

var FoodSchema = new Schema({
	name: String,
	spoon_id: Number,
	category: {type: Schema.Types.ObjectId, ref: 'Category'},
	img_url: String,
	nutrients: [],
	user_preference: [],
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

FoodSchema.plugin(random, { path: 'r' });

module.exports = mongoose.model('Food', FoodSchema);
