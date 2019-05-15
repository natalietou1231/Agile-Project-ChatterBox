const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

var User = require('./model');
var auth = require('./auth');

var today = new Date();

module.exports = (passport) =>{
    passport.serializeUser((user, done)=> {
        //console.log(user);
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

    passport.use('facebook', new FacebookStrategy({
            clientID: auth.facebookAuth.clientID,
            clientSecret: auth.facebookAuth.clientSecret,
            callbackURL: auth.facebookAuth.callbackURL,
        },
        (accessToken, refreshToken, profile, done) =>{
            mongoose.model('users').find({'facebook.id': profile.id
            },(err, user)=>{
                if(err){
                    return done(err);
                }

                if(user.length === 0) {
                    var newUser = new User({
                        facebook:{
                            id: profile.id,
                            token: accessToken,
                            first_name: profile.displayName.split(" ")[0],
                            last_name: profile.displayName.split(" ")[1],
                            username: profile.displayName.split(' ').join('.'),
                            registration_date: today
                        }
                    });
                    newUser.save((err)=>{
                        if(err)
                            throw err;
                        return done(null, newUser);
                    });
                }else{
                    return done(null, user[0]);
                }
            });
        }

    ));

};