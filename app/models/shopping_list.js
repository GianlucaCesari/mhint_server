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
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
