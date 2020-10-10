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


// Edit comment
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			console.log(err);
			res.redirect("back");
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});
});

// Update comment
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if (err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

// Destroy comment
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if (err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;

// Middleware - check if user is logged in
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

// Middleware - check that user is owner of comment
function checkCommentOwnership(req, res, next) {
	// Is user logged in?
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if (err) {
				res.redirect("back");
			} else {
			// Is user the owner of this comment?
			// use mongoose .equals() method because foundComment.author.id 
			// is a mongoose object while req.user.id is a string
				if (foundComment.author.id.equals(req.user.id)) {
					next();
				} else {
					res.redirect("back");
				};
			};
		});
	} else {
		res.redirect("back");
	};
};