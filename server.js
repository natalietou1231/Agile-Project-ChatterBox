// const path = require('path');
// const favicon = require('serve-favicon');
// const logger = require('morgan');
const passport = require('passport');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const hbs = require('hbs');
const bcrypt = require('bcrypt-nodejs');
const LocalStrategy = require('passport-local').Strategy;
const port = process.env.PORT || 8080;

var utils = require('./utils');
var msgs = require('./messages');
var User = require('./model');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var today = new Date();
var clients = [];

// hbs
app.set('view engine', 'hbs');

// Express body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser('thesecret'));

// Express session
app.use(session({
    secret: 'thesecret',
    saveUninitialized: true,
    resave: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//hbs partials
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('getCurrentYear', ()=>{
    return today.getFullYear();
});

var ensureAuthenticated =(req, res, next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login');
    }

};

// app.use((req,res,next)=>{
//    console.log(req.user);
//    console.log(req.session.user);
//    next();
// });


app.get('/', (req, res)=>{
    res.render('index.hbs', {
        title: 'Home page',
        h1: 'Welcome .....',
        link1: 'Sign up',
        link2: 'Log in',
        pages: ['/signup', '/login']
    });
});

app.get('/login', (req, res)=> {
    res.render('login.hbs', {
        title: 'Login',
        h1: 'Login',
        box1: 'username',
        box2: 'password',
        pages: ['/signup',  '/'],
        isError: 'false',
        error: ''
    });
});

app.get('/login/incorrect', (req, res)=> {
    res.render('login.hbs', {
        title: 'Login',
        h1: 'Login',
        box1: 'username',
        box2: 'password',
        pages: ['/signup',  '/'],
        isError: 'true',
        error: 'Incorrect login information.'
    });
});

passport.use(new LocalStrategy((username, password, done)=> {
        mongoose.model('users').find({
            username: username
        }, (err, user)=> {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (bcrypt.compareSync(password, user[0].password)){
                // console.log(user[0]);
                return done(null, user[0]);

            }else{
                return done(null, false);
            }
        });
    }
));

app.post('/login', (req, res, next)=> {
    passport.authenticate('local', {
        successRedirect: '/chatroom',
        failureRedirect: '/login/incorrect',
    })(req, res, next);
});


// app.post('/login', (req, res)=> {
//     var username = req.body.username;
//     var password = req.body.password;
//
//     mongoose.model('users').find({username:username}, (err,user)=>{
//         if (err){
//             res.send('Unable to find user.');
//         }
//         if (user.length == 0){
//             res.redirect('/login/incorrect');
//
//         }else{
//             if (bcrypt.compareSync(password, user[0].password)){
//                 req.session.user = user;
//                 res.redirect('/chatroom');
//             }else{
//                 res.redirect('/login/incorrect');
//             }
//
//         }
//
//     });
//
// });

passport.serializeUser((user, done)=> {
    //console.log(user);
    done(null, user._id);
});

// passport.deserializeUser((user, done)=> {
//     done(null, user);
// });

passport.deserializeUser((id, done)=> {
    User.findById(id, (err, user)=> {
        done(err, user);
    });
});


app.get('/signup', (req, res)=> {
    res.render('signup.hbs', {
        title: 'Sign up',
        h1: 'Sign up',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        pages: ['/login',  '/'],
        isError: 'false',
        error: ''
    });
});

app.get('/signup/exists', (req, res)=> {
    res.render('signup.hbs', {
        title: 'Sign up',
        h1: 'Sign up',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        pages: ['/login',  '/'],
        isError: 'true',
        error: 'User already exists.'
    });
});


app.post('/signup', (req, res)=> {
    var user = new User ({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        registration_date: today
    });

    mongoose.model('users').find({$or:[{username:req.body.username},{email:req.body.email}]},(err,doc)=>{
        if (err){
            res.send('Unable to add user.');
        }
        if (doc.length === 0){
            user.save();
            // res.send(req.body);
            res.redirect('/login');
        }else{
            res.redirect('/signup/exists');
        }

    });

});

app.get('/logout', (req, res)=> {
    var index = clients.indexOf(req.user.username);
    if (index > -1) {
       clients.splice(index, 1);
    }
    req.logout();
    res.redirect("/");
});

// app.get('/aaa', (req, res)=>{
//     mongoose.model('users').find({},(err,users)=>{
//         res.send(users);
//     });
// });

app.get('/profile/:username', function(req, res) {
    mongoose.model('users').find({username: req.params.username},(err,user)=>{
        if (err){
            res.send('User does not exist.');
        }else{
            res.render('profile.hbs', {
                title: 'Profile',
                username: user[0].username,
                name: user[0].first_name + " " + user[0].last_name,
                email: user[0].email,
                link:'/'
            });
        }

    });
});

app.get('/chatroom', ensureAuthenticated,(req, res)=> {
        clients.push(req.user.username);
        res.render('chat.hbs', {
            title: 'ChatterBox',
            page: 'Log out',
            link: ['/logout','/account'],
            username: `${req.user.username}`
        });
});

// app.get('/chatroom', ensureAuthenticated,(req, res)=> {
//     if (!req.session.user){
//         res.redirect('/login')
//     }else{
//         clients.push(req.session.user[0].username);
//         res.render('chat.hbs', {
//             title: 'ChatterBox',
//             page: 'Log out',
//             link: ['/logout','/account'],
//             username: `${req.session.user[0].username}`
//         });
//     }
// });
app.get('/account',(req,res)=> {
    // console.log(req.session.user)

    res.render('account.hbs',{
        title: 'ChatterBox',
        link: ['/chatroom','/logout'],

        username: `${req.user.username}`,
        email: `${req.user.email}`,
        name: `${req.user.first_name + req.user.last_name} `,
        updateLink:['/account/update']

    })
});
app.get('/account/update',(req,res)=>{
    res.render('update.hbs', {
        title: 'Update Account',
        h1: 'Update Account',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        username: `${req.user.username}`,
        email: `${req.user.email}`,
        first_name: `${req.user.first_name}`,
        last_name: `${req.user.last_name}`,
        link: '/account',
        isError: 'false',
        error: ''
    });
});

app.get('/account/update/exists', (req, res)=> {
    res.render('update.hbs', {
        title: 'Update Account',
        h1: 'Update Account',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        username: `${req.user.username}`,
        email: `${req.user.email}`,
        first_name: `${req.user.first_name}`,
        last_name: `${req.user.last_name}`,
        link: '/account',
        isError: 'true',
        error: 'User already exists.'
    });
});

app.post('/account/upate-form', (req, res)=>{
    var user = new User ({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        registration_date: req.user.registration_date
    });
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = bcrypt.hashSync(req.body.password);
    var username = req.body.username;

    mongoose.model('users').find({$or:[{username:req.body.username},{email:req.body.email}]},(err,doc)=>{
        if (err){
            res.send('Unable to add user.');
        }
        if (doc.length < 2){
            mongoose.model('users').updateOne({_id: req.user._id}, {
                $set:{
                    username: username,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    registration_date: req.user.registration_date
                }
            }, (err, doc)=>{
                if(err) {
                    res.send(err)
                }else if(doc.ok===1){
                    temp = req.user._id;
                    req.user = user;
                    req.user._id = temp;
                    res.redirect('/account');

                }
            })
        }else{
            res.redirect('/account/update/exists');
        }

    });

});


var chatLog = [];
const MAXLOGS = 100;
var logMessage = (user, msg) => {
    newLog = {
        user: user,
        msg: msg
    };
    chatLog.push(newLog);
    if (chatLog.length >= MAXLOGS) {
        chatLog.shift()
    }
};

var chat = io.of('/chatroom');
chat.on('connection', (socket) => {
    socket.hasName = false;

    socket.on('add user', (user, colour) => {
        for (clientIndex in clients){
            if (clients[clientIndex] === user){
                socket.isClient = true;
                break;
            }
        }
        if (!socket.hasName && socket.isClient) {
            socket.username = user;
            socket.colour = colour;
            socket.hasName = true;
            for (i = 0; i < chatLog.length; i++){
                socket.emit('chat message', chatLog[i].msg, chatLog[i].user);
            }
            msg = `<li><span style="color: #${socket.colour}"><a href=/profile/${socket.username} target="_blank" >` + socket.username + '</a></span> <span style="font-size: 85%; color: darkgrey">connected!</span></li>';
            logMessage("", msg);
            chat.emit('chat message', msg, "");
        }
    });

    socket.on('chat message', (msg) => {
        if(!socket.username){
            socket.username = "L337NATION";
            socket.colour = 'e914c6';
            socket.hasName= false;
        }
        time = msgs.getTime();
        try {
            msg = msgs.createMessage(msg, socket.username, time, socket.colour);
        } catch (err) {
            msg = msgs.createMessage(err.message, socket.username, time, socket.colour);
        }
        if (socket.username != "L337NATION"){
            logMessage(socket.username, msg);
        }
        chat.emit('chat message', msg, socket.username);
    });

    socket.on('disconnect', () => {
        msg = `<li><span style="color: #${socket.colour}"><a href=/profile/${socket.username} target="_blank" >` + socket.username + '</a></span> <span style="font-size: 85%; color: darkgrey">disconnected :(</span></li>';
        logMessage("", msg);
        chat.emit('chat message', msg, "");
    });
});

http.listen(port, ()=>{
    console.log('Server is up on the port 8080');
    utils.init();
});

module.exports = app;