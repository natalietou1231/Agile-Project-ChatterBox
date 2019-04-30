const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    first_name:String,
    last_name:String,
    email:String,
    registration_date: Date
});


module.exports = mongoose.model('users', userSchema);