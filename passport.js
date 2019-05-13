const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

var User = require('./model');
var auth = require('./auth');

module.exports = (passport) =>{
    passport.serializeUser((user, done)=> {
        done(null, user._id);
    });

    passport.deserializeUser((id, done)=> {
        User.findById(id, (err, user)=> {
            done(err, user);
        });
    });

    passport.use('local', new LocalStrategy((username, password, done)=> {
            mongoose.model('users').find({
                'local.username': username
            }, (err, user)=> {
                //console.log(user[0].local);
                if (err) {
                    return done(err);
                }

                if (user.length == 0) {
                    return done(null, false);
                }

                if (bcrypt.compareSync(password, user[0].local.password)){
                    // console.log(user[0]);
                    return done(null, user[0]);

                }else{
                    return done(null, false);
                }
            });
        }
    ));

};