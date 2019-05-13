const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    local:{
        username: String,
        password: String,
        first_name:String,
        last_name:String,
        email:String,
        registration_date: Date
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    }

});

module.exports = mongoose.model('users', userSchema);