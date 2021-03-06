// Express
var express = require('express');
var app = express();
const port = 80;

// Path
var path = require("path")

// Express Handlebars
var exphbs = require("express-handlebars");
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// MongoDB & Mongoose
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/caleat', {useNewUrlParser: true})
var db = mongoose.connection;

// Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

// Express Sessions
var session = require('express-session')
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

// Keys
var keys = require('./keys/secrets')

// Meal Schema
var Meal = require('./models/meal')

app.get('/search',requiresLogin, (req,res) => {
	res.render('index');
})

app.post('/save-meal',requiresLogin, (req,res) => {
	console.log(req.body);
	var quantity = req.body.quantity;
	var nutrients = req.body.nutrients;
	var label = req.body.label;
	var time = req.body.time;
	if(quantity&&nutrients&&time&&label&&req.session.userId){
		(new Meal({userId: req.session.userId, quantity:quantity, nutrients:nutrients, label:label, time:time})).save()
		res.redirect("/profile")
	}else{
		res.redirect('/failure')
	}
})


// User Model
var User = require("./models/user.js")

// Login required Middleware
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
  	res.redirect('/login')
  }
}

// Register Page and Response
app.get('/register', (req,res) => {
	res.render("register");
})
app.post('/register', (req,res) => {
	// Posted Data
	var username = req.body.username
	var password = req.body.password
	var password2 = req.body.password2
	var email = req.body.email
	var gender = req.body.gender
	var height = req.body.height
	var weight = req.body.weight
	var age = req.body.age

	// Search for username matches
	User.getUserByUsername(username, (usernameErr, usernameMatch) => {
		if(usernameErr) throw usernameErr
		// Search for email matches
		User.getUserByEmail(email, (emailErr, emailMatch) => {
			if(emailErr) throw emailErr
			// Validation checks	
			var errors = []
			if(!username || !password || !password2 || !email || !gender || !height || !weight || !age){
				// MISSING FIELDS
				errors[errors.length] = "MISSING FIELDS"
			}
			if(!(password2 == password)){
				// NON MATCHING PASSWORDS
				errors[errors.length] = "PASSWORDS DONT MATCH"
			}
			if(usernameMatch){
				// USERNAME TAKEN
				errors[errors.length] = "USERNAME TAKEN"
			}
			if(emailMatch){
				// EMAIL TAKEN
				errors[errors.length] = "EMAIL IN USE"
			}
			// Create user if validation passes
			if(errors.length == 0){
				User.createUser(new User({
					email: email,
					username: username,
					password: password2,
					gender: gender,
					weight: weight,
					height: height,
					age: age
				}));
				res.redirect('/login')
			}else{
				// Else send errors
				res.send("errors : " + errors)
			}

		});
	});
	
})

// Login
app.get('/login', (req,res) => {
	res.render("login");
})
app.post('/login', (req,res) => {
	
	// Posted Data
	var username = req.body.username
	var password = req.body.password
	
	User.authenticate(username, password, function (error, user) {
      if (error || !user) {
        res.redirect('/login')
      } else {
        req.session.userId = user._id;
        res.redirect('/search');
      }
    });
})

// Log out
app.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/login');
      }
    });
  }
});

function calorieEquate(height,weight,gender,age)
{
	if(height&&weight&&gender&&age){
		if (gender.trim() == "M" || gender.trim() == "m") 
	    {
	        return 66 + (6.2 * +weight) + (12.7 * +height) - (6.76 * +age);
	    }
	    else if (gender.trim() == "F" || gender.trim() == "f")
	    {
	        return 655.1 + (4.35 * +weight) + (4.7 * +height) - (4.7 * +age);
	    }	
	}
    
}

// Home
app.get('/profile', requiresLogin , function(req, res, next) {
  User.findById(req.session.userId, (err, user) => {
  	var cals = calorieEquate(user.height, user.weight, user.gender, user.age);
  	console.log(JSON.stringify(user));
  	res.render('profile', {calorie: cals});
  })
});

app.get('/date-meals', requiresLogin, function(req,res,next) {
	if(req.query.date){
		Meal.findMealsOnDateByUserId(req.session.userId, req.query.date, (err,json) => {
			if (err) throw err
			console.log(json)
			res.send(json)
		})
	}else{
		res.redirect('/failure')
	}
})

// Fail page
app.get('/failure', function(req,res,next) {
	res.render('fail')
})


// Set static folder
app.use(express.static(path.join(__dirname,'public')))

// Set port
app.listen(port, () => console.log(`Example app listening on port ${port}!`));