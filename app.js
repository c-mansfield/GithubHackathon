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
mongoose.connect('mongodb://localhost/loginapp', {useNewUrlParser: true})
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

app.get('/search', (req,res) => {
	res.render('index');
})

// Set static folder
app.use(express.static(path.join(__dirname,'public')))

// Set port
app.listen(port, () => console.log(`Example app listening on port ${port}!`));