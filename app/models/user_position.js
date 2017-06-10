var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require("./user");

var UserPositionSchema = new Schema({
	position: {
		coordinates: [Number],
		type: {
            type: String,
            required: true,
            enum: ["Point", "LineString", "Polygon"],
            default: "Point"
    },
	},
	display_position: {
		lat: Number,
		long: Number
	},
	user_id: {type: Schema.Types.ObjectId, ref: 'User'},
	is_last: {type: Boolean, default: true},
	created_at: Date
});

UserPositionSchema.pre('save', function(next){
  now = new Date();
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

UserPositionSchema.index({ position: "2dsphere" });

module.exports = mongoose.model('UserPosition', UserPositionSchema);
