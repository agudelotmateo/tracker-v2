// schema of the users collection and related query functions

// imports
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/database");

const UserSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { collection: "users" });

const User = module.exports = mongoose.model("User", UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function (name, callback) {
    User.findOne({ username: name }, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    User.findOne({ email: email }, callback);
}

module.exports.addUser = function (user, callback) {
    // hash password
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err)
                throw err;
            user.password = hash;
            user.save(callback);
        });
    });
}

module.exports.comparePasswords = function (possiblePass, hash, callback) {
    bcrypt.compare(possiblePass, hash, function (err, match) {
        if (err)
            throw err;
        callback(null, match);
    });
}
