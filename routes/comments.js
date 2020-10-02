const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");

// New Comment
router.get("/new", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
				res.render("comments/new", {campground: campground});
		}
	});
});

// Create Comment
router.post("/", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");			
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					console.log(err);
				}	else {
					// add username and id to comment
					comment.author.username = req.user.username;
					comment.author.id = req.user._id;
					// save comment
					comment.save()
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				};
			});
		}
	});
});

module.exports = router;

// Middleware
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};