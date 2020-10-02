const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");

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
router.post("/", (req, res) => {
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

// New
router.get("/new", (req, res) => {
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

module.exports = router;