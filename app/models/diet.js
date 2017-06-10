var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DietSchema = new Schema({
	name: String,
	img_url: String,
	description: String,
	kcal: String,
	created_at: Date,
	updated_at: Date
});

DietSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('Diet', DietSchema);
