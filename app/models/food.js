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
	created_at: Date,
	updated_at: Date
});

FoodSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

FoodSchema.plugin(random, { path: 'r' });

module.exports = mongoose.model('Food', FoodSchema);
