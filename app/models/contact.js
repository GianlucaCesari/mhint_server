var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ContactSchema = new Schema({
    contact_id: Schema.Types.ObjectId,
    name: String,
    prefix : String,
    tel_number: Number,
    created_at: Date,
    updated_at: Date
});

ContactSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
