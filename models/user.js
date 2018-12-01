// Mongoose
var mongoose = require("mongoose");

// Bcrypt
var bcrypt = require('bcrypt')

// User Schema
var UserSchema = mongoose.Schema({
	username:{
		type: String
	},
	password:{
		type: String
	},
	email:{
		type: String
	}
})

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

var User = module.exports = mongoose.model('User', UserSchema);

//authenticate input against database
module.exports.authenticate = function (username, password, callback) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return callback(null, null);
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result === true) {
        return callback(null, user);
      } else {
        return callback(null, null);
      }
    })
  })
}

module.exports.createUser = function(newUser, callback){
	newUser.save(callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

