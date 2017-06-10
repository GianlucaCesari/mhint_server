var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShoppingItemSchema = new Schema({
	name: String,
	value: String,
	unit: String,
	checked: {
		type: Boolean,
		default: false
	},
	created_at: Date,
	updated_at: Date
});

ShoppingItemSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('ShoppingItem', ShoppingItemSchema);
