var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ContactSchema = new Schema({
    contact_id: Schema.Types.ObjectId,
    name: String,
    prefix : String,
    tel_number: Number,
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
