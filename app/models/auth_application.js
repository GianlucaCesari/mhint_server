var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

// function makeapikey(len) {
//   var text = "";
//   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//
//   for (var i = 0; i < len; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// }

var AuthApplicationSchema = new Schema({
  app_name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    default: "pending"
  },
  api_key: {
    type: String,
    default: function() {
			var text = "";
		  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		  for (var i = 0; i < 48; i++) {
		    text += possible.charAt(Math.floor(Math.random() * possible.length));
		  }
		  return text;
		}
  },
  created_at: Date,
  updated_at: Date
});

AuthApplicationSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('AuthApplication', AuthApplicationSchema);
