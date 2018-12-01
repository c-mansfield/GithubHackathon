// Mongoose
var mongoose = require("mongoose");

// User Schema
var MealSchema = mongoose.Schema({
	userId:{
		type: String
	},
	quantity:{
		type: String
	},
	time:{
		type: String
	},
  nutrients:{
    type: String
  },
  label:{
    type: String
  }
})


var Meal = module.exports = mongoose.model('Meal', MealSchema);
