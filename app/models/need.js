var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var NeedRequest = require('./need_request');
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
	// user_requests: [{type: Schema.Types.ObjectId, ref: 'NeedRequest'}],
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
