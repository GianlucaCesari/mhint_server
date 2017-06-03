var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShoppingItemSchema = new Schema({
	name: String,
	value: Number,
	unit: String,
	checked: {
		type: Boolean,
		default: false
	},
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('ShoppingItem', ShoppingItemSchema);
