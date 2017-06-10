var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShoppingList = require('./shopping_list');
var Recipe = require('./recipe');
var User = require('./user');

var WeeklyPlanSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	items: [],
	shopping_list: {type: Schema.Types.ObjectId, ref: 'ShoppingList'},
	created_at: Date,
	updated_at: Date
});

WeeklyPlanSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('WeeklyPlan', WeeklyPlanSchema);
