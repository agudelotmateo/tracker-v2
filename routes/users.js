// routing for '/users'

// imports
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Location = require("../models/location");
const config = require("../config/database");
const keys = require("../config/keys");
const router = express.Router();

// '/users/record' route
router.post("/record/:apiKey", function (req, res, next) {
    if (keys.apiKeys.has(req.params.apiKey)) {
        let newLocation = new Location({
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            username: req.body.username
        });
        Location.addLocation(newLocation, function (err, user) {
            if (err) {
                console.log(err);
                res.json({ success: false, msg: "Failed to record location" });
            }
            else
                res.json({ success: true, msg: "Location successfully recorded" });
        });
    } else
        res.json({ success: false, msg: "Invalid API key" });
});

// '/users/register' route
router.post("/register/:apiKey", function (req, res, next) {
    if (keys.apiKeys.has(req.params.apiKey)) {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        User.getUserByUsername(newUser.username, function (err, user) {
            if (err)
                throw err;
            if (user)
                return res.json({ success: false, msg: "Username already in use" });
            User.getUserByEmail(newUser.email, function (err, user) {
                if (err)
                    throw err;
                if (user)
                    return res.json({ success: false, msg: "Email already in use" });
                User.addUser(newUser, function (err, user) {
                    if (err)
                        res.json({ success: false, msg: "Failed to register user" });
                    else
                        res.json({ success: true, msg: "User successfully registered" });
                });
            });
        });
    } else
        res.json({ success: false, msg: "Invalid API key" });
});

// '/users/authenticate' route
router.post("/authenticate/:apiKey", function (req, res, next) {
    if (keys.apiKeys.has(req.params.apiKey)) {
        const username = req.body.username;
        const password = req.body.password;
        User.getUserByUsername(username, function (err, user) {
            if (err)
                throw err;
            if (!user)
                return res.json({ success: false, msg: "User not found" });
            User.comparePasswords(password, user.password, function (err, match) {
                if (err)
                    throw err;
                if (match) {
                    // after upgrade, getting it as object using `.toObject()` is required
                    const token = jwt.sign(user.toObject(), config.secret, {
                        expiresIn: 604800 // 1 week
                    });
                    res.json({
                        success: true,
                        token: "JWT " + token,
                        user: {
                            id: user._id,
                            name: user.name,
                            username: user.username,
                            email: user.email
                        }
                    });
                } else
                    res.json({ success: false, msg: "Wrong password" });
            });
        });
    } else
        res.json({ success: false, msg: "Invalid API key" });
});

// '/users/profile' route
router.get("/profile/:apiKey", passport.authenticate("jwt", { session: false }), function (req, res, next) {
    if (keys.apiKeys.has(req.params.apiKey))
        res.json({
            user: req.user
        });
    else
        res.json({ success: false, msg: "Invalid API key" });
});

// '/users/location' route
router.get("/location/:apiKey/:username", passport.authenticate("jwt", { session: false }), function (req, res, next) {
    if (keys.apiKeys.has(req.params.apiKey))
        Location.find({ "username": req.params.username }, function (err, location) {
            if (err)
                throw err;
            else
                res.json({ location: location });
        });
    else
        res.json({ success: false, msg: "Invalid API key" });
});

// export the router
module.exports = router;
