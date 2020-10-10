const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// Root
router.get("/", (req, res) => {
	res.render("landing");
});

//====AUTH routes====
// Register Form Route
router.get("/register", (req,res) => {
	res.render("register");
});

// Sign Up Logic
router.post("/register", (req,res) => {
	// user.register() from passport-local-mongoose
	let newUser = new User({username: req.body.username});
	// username and password passed through req object
	// register handles the password, stores as hash
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});


// Login Form
router.get("/login", (req,res) => {
	res.render("login");
});

// Login Logic
router.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), (req,res) => {
});

// Logout Route
router.get("/logout", (req, res) => {
	//from packages
	req.logout();
	req.flash("success", "Logged you out.");
	res.redirect("/campgrounds");
});

module.exports = router;