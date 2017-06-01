var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');
var NeedRequest = require('./need_request');

var NeedSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
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
	user_requests: [],
	created_at: {
		type: Date,
		default: Date.now()
	},
	updated_at: {
		type: Date,
		default: Date.now()
	}
});

NeedSchema.index({ request_position: "2dsphere" });

module.exports = mongoose.model('Need', NeedSchema);
