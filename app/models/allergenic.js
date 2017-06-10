var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AllergenicSchema = new Schema({
	name: String,
	img_url: String,
	created_at: Date,
	updated_at: Date
});

AllergenicSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('Allergenic', AllergenicSchema);
