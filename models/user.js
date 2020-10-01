//set up the user model
//
//require mongoose and local passport
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

//define the userschema
const UserSchema = new mongoose.Schema({
	username: String,
	password: String
});

//adds built in methods from passport local mongoose to our user schema
UserSchema.plugin(passportLocalMongoose);

//exports the model through mongoose?
module.exports = mongoose.model("User", UserSchema);