// main file

// imports
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
// this one is a core module so it requires no dependencies
const path = require("path");
// improt an external file (for routing) 
const users = require("./routes/users");
// improt an external file (for db connection) 
const config = require("./config/database.js");

// initalize the app with Express
const app = express();

// select the port 
const port = process.env.PORT || 3000;

// connect to the DB
mongoose.connect(config.database);
// DB connection status logging
mongoose.connection.on("connected", function () {
    console.log("Connected to the " + config.database + " database!");
});
mongoose.connection.on("error", function (err) {
    console.log("Database connection error: " + err);
});

// cors middleware allows us to make a request to our API form
// a different domain name, because by default we'd get blocked
// from doing certain requests
// this way we're making it accessible from any domain
// it can be configured to be more specific of course
// but we'll use authentication anyway
app.use(cors());

// BodyParser middleware
app.use(bodyParser.json());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// set the static folder
app.use(express.static(path.join(__dirname, "public")));

// set the routing for '/users' using Express' router
app.use("/users", users);

// set the routing for index ('/')
app.get("/", function (req, res) {
    // this route won't be used by our back end
    res.send("Invalid");
});

// start the server listening to port 'port'
app.listen(port, function () {
    console.log("Server started on port " + port.toString() + "!");
});
