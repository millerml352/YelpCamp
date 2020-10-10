const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

// Index
router.get("/", (req, res) => {
	// Get campgrounds from DB
	Campground.find({}, (err, allCampgrounds) => {
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

// Create
router.post("/", middleware.isLoggedIn, (req, res) => {
	// get data from form and add to campgrounds array
	let name = req.body.name;
	let image = req.body.image;
	let description = req.body.description;
	let author = {
		id: req.user._id, 
		username: req.user.username};
	let newCampground = {name: name, image: image, author: author, description: description};
	//Create new campground and save to mongodb
	Campground.create(newCampground, (err, newlyCreated) => {
			if (err) {
				console.log(err);
			} else {
				res.redirect("/campgrounds");
			}			  
	});
});

// New
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// Show
router.get("/:id", (req, res) => {
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

// Edit
router.get("/:id/edit", middleware.checkOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("./campgrounds/edit", {campground: foundCampground});
	});
});

// Update
router.put("/:id", middleware.checkOwnership, (req, res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// Destroy
router.delete("/:id", middleware.checkOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err, removedCampground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		}
		Comment.deleteMany( {_id: { $in: removedCampground.comments } }, (err) => {
			if (err) {
				console.log(err);
			}
			res.redirect("/campgrounds");
		})
	});
});

module.exports = router;