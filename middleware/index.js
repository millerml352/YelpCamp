const Campground = require("../models/campground");
const Comment = require("../models/comment");

// All the middleware
const middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to perform that action.");
    res.redirect("/login");
};

middlewareObj.checkOwnership = (req, res, next) => {
    // Is user logged in?
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                req.flash("error", "Campground not found!");
                res.redirect("back");
            } else {
            // Is user the owner of this campground?
            // use mongoose .equals() method because foundCampground.author.id 
            // is a mongoose object while req.user.id is a string
                if (foundCampground.author.id.equals(req.user.id)) {
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                };
            };
        });
    } else {
        req.flash("error", "You must be logged in to perform that action.");
        res.redirect("back");
    };
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
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
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                };
            };
        });
    } else {
        req.flash("error", "You must be logged in to perform that action.");
        res.redirect("back");
    };
};

module.exports = middlewareObj;