var mongoose = require('mongoose');
var Food = require('./food');
var Schema = mongoose.Schema;

var UserPreferenceSchema = new Schema({
	user_mail: String,
	food: {type: Schema.Types.ObjectId, ref: 'Food'},
	type: String,
	created_at: Date,
	updated_at: Date
});

UserPreferenceSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
