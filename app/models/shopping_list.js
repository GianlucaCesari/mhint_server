var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShoppingItem = require('./shopping_item');
var User = require('./user');

var ShoppingListSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	title: String,
	items: [{type: Schema.Types.ObjectId, ref: 'ShoppingItem'}],
	completed: {
		type: Boolean,
		default: false
	},
	completed_at: Date,
	created_at: Date,
	updated_at: Date
});

ShoppingListSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
