const express 		= require("express"),
	  app 			= express(),
	  bodyParser 	= require("body-parser"),
	  mongoose 		= require("mongoose"),
	  passport 		= require("passport"),
	  LocalStrategy = require("passport-local"),
	 methodOverride = require("method-override"),
	  Campground 	= require("./models/campground"),
	  Comment 		= require("./models/comment"),
	  User 			= require("./models/user"),
	  seedDB 		= require("./seeds"),
	  flash  		= require("connect-flash");

// Requiring routes
const campgroundRoutes = require("./routes/campgrounds"),
		 commentRoutes = require("./routes/comments"),
		   indexRoutes = require("./routes/index");

// Connect to the mongoDB yelp_camp and error handler
mongoose.connect("mongodb://localhost:27017/yelp_camp",{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// Seed the DB with sample campgrounds on startup
// seedDB();

// PASSPORT configuration
app.use(require("express-session")({
	// Any phrase
	secret: "well you better go catch it",
	// Required
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// Built-in passport methods usable because of the plugin line in our user model
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to provide variables to all routes
app.use(function(req,res,next){
	// passes currentUser to all
	res.locals.currentUser = req.user;
	// passes flash messages to all
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// Use route variables declared up top; allows routes to be shortened in respective files according to these prefixes
app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// Run server
app.listen(3000, () => {
	console.log("Running on port 3000...");
});