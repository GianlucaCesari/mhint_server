var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NutrientSchema = new Schema({
	name: String,
	amount: String,
	value: Number,
	created_at: Date,
	updated_at: Date
});

NutrientSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('Nutrient', NutrientSchema);
