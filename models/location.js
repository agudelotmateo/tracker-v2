// imports
const mongoose = require("mongoose");

const LocationSchema = mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { collection: "locations" });

const Location = module.exports = mongoose.model("Location", LocationSchema);

module.exports.addLocation = function (location, callback) {
    location.save(callback);
}
