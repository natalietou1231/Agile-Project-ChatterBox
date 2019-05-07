const mongoose = require('mongoose');

module.exports.init = function(){
    mongoose.connect('mongodb+srv://admin:112233444@cluster0-om2ow.mongodb.net/chatroom', { useNewUrlParser: true } );
    var db = mongoose.connection;
    var path = require('path');
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log('Successfully connected to MongoDB server');
    });
};

