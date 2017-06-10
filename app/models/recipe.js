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
	created_at: Date,
	updated_at: Date
});

RecipeSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

RecipeSchema.plugin(random, { path: 'r' });

module.exports = mongoose.model('Recipe', RecipeSchema);
