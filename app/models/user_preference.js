var mongoose = require('mongoose');
var Food = require('./food');
var Schema = mongoose.Schema;

var UserPreferenceSchema = new Schema({
	user_id: String,
	food: { type: Schema.Types.ObjectId, ref: 'Food' },
	type: String,
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
