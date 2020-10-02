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

//connect to the mongoDB yelp_camp
mongoose.connect("mongodb://localhost:27017/yelp_camp",{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//seed the DB with sample campgrounds on startup
seedDB();

// PASSPORT configuration
app.use(require("express-session")({
	//any phrase
	secret: "well you better go catch it",
	//two required lines
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
//User.authenticate and serialize/deserialize methods are usable because of the plugin line in our user model
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to provide currentUser to all routes
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

//root
app.get("/", (req, res) => {
	res.render("landing");
});

//INDEX
app.get("/campgrounds", (req, res) => {
	//get campgrounds from mongodb
	Campground.find({}, (err, allCampgrounds) => {
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

//CREATE
app.post("/campgrounds", (req, res) => {
	// get data from form and add to campgrounds array
	let name = req.body.name;
	let image = req.body.image;
	let description = req.body.description;
	let newCampground = {name: name, image: image, description: description};
	//Create new campground and save to mongodb
	Campground.create(newCampground, (err, newlyCreated) => {
			if (err) {
				console.log(err);
			} else {
				res.redirect("/campgrounds");
			}			  
	});
});

//NEW
app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

//SHOW
app.get("/campgrounds/:id", (req, res) => {
	// find campground w/ provided mongodb ID
	Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			console.log(foundCampground);
		res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// ==========COMMENT ROUTES============
//
//
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
				res.render("comments/new", {campground: campground});
		}
	});
});

//
app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");			
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					console.log(err);
				}	else {
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				};
			});
		}
	});
});

//=======
//AUTH routes
//========

//show register form
app.get("/register", (req,res) => {
	res.render("register");
});

//handle signup logic
app.post("/register", (req,res) => {
	// user.register() from passport-local-mongoose
	let newUser = new User({username: req.body.username});
	// username and password passed through req object
	// register handles the password, stores as hash
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/campgrounds");
		});
	});
});


// show login form
app.get("/login", (req,res) => {
	res.render("login");
});

// handle login logic
//
// app.post(route, middleware, callback)
//
// when a login post is made the passport.authenticate() middle ware
// runs first. uses new localstrategy from line 39 to check provided
// username and password and redirect appropriately
// could get rid of callback since its not doing anything but
// doesnt cause a problem
app.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), (req,res) => {
});

//logout route
app.get("/logout", (req, res) => {
	//from packages
	req.logout();
	res.redirect("/campgrounds");
});

// check if user is logged in middleware
// add to any route that you want limited to users e.g. comments
// if logged in returns next function e.g. the new comment callback
// otherwise redirects to login page
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

//run server
app.listen(3000, () => {
	console.log("Running on port 3000...");
});


