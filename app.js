const express 		= require("express"),
	  app 			= express(),
	  bodyParser 	= require("body-parser"),
	  mongoose 		= require("mongoose"),
	  passport 		= require("passport"),
	  LocalStrategy = require("passport-local"),
	  Campground 	= require("./models/campground"),
	  Comment 		= require("./models/comment"),
	  User 			= require("./models/user"),
	  seedDB 		= require("./seeds");

// Requiring routes
const commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");

// Connect to the mongoDB yelp_camp
mongoose.connect("mongodb://localhost:27017/yelp_camp",{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// Seed the DB with sample campgrounds on startup
// seedDB();

// PASSPORT configuration
app.use(require("express-session")({
	// Any phrase
	secret: "well you better go catch it",
	// Two required lines
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// User.authenticate and serialize/deserialize methods are usable because of the plugin line in our user model
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to provide currentUser to all routes
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// Run server
app.listen(3000, () => {
	console.log("Running on port 3000...");
});


