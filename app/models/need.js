var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

var NeedSchema = new Schema({
	user_sender: {type: Schema.Types.ObjectId, ref: 'User'},
	user_receiver : {type: Schema.Types.ObjectId, ref: 'User'},
	display_position: {
		lat: Number,
		long: Number
	},
	request_position: {
		coordinates: [Number],
		type: {
            type: String,
            required: true,
            enum: ["Point", "LineString", "Polygon"],
            default: "Point"
    },
	},
	name: String,
	description: String,
	type: String,
	status: {
		type: String,
		default: "pending"
	},
	created_at: Date,
	updated_at: Date
});

NeedSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

NeedSchema.index({ request_position: "2dsphere" });

module.exports = mongoose.model('Need', NeedSchema);
