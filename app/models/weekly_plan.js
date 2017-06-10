var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShoppingList = require('./shopping_list');
var Recipe = require('./recipe');
var User = require('./user');

var WeeklyPlanSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	items: [],
	shopping_list: {type: Schema.Types.ObjectId, ref: 'ShoppingList'},
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('WeeklyPlan', WeeklyPlanSchema);
