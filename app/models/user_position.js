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
	user_id: {type: Schema.Types.ObjectId, ref: 'User'},
	is_last: {type: Boolean, default: true},
	created_at: {
		type: Date,
		default: Date.now()
	}
});

UserPositionSchema.index({ position: "2dsphere" });

module.exports = mongoose.model('UserPosition', UserPositionSchema);
