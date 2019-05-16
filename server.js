const passport = require('passport');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const hbs = require('hbs');
const bcrypt = require('bcrypt-nodejs');

const port = process.env.PORT || 8080;

var utils = require('./utils');
var msgs = require('./messages');
var User = require('./model');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var today = new Date();
var clients = [];

require('./passport')(passport);

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

app.get('/', (req, res)=>{
    res.render('index.hbs', {
        title: 'Home page',
        h1: 'Welcome .....',
        link1: 'Sign up',
        link2: 'Log in',
        link3: 'Facebook',
        pages: ['/signup', '/login']
    });
});

app.get('/login', (req, res)=> {
    res.render('login.hbs', {
        title: 'Login',
        h1: 'Login',
        box1: 'username',
        box2: 'password',
        pages: ['/signup',  '/', '/auth/facebook'],
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
        pages: ['/signup',  '/', '/auth/facebook'],
        isError: 'true',
        error: 'Incorrect login information.'
    });
});

app.post('/login', (req, res, next)=> {
    passport.authenticate('local', {
        successRedirect: '/chatroom',
        failureRedirect: '/login/incorrect',
    })(req, res, next);
});


app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/chatroom',
        failureRedirect: '/' }));

app.get('/signup', (req, res)=> {
    res.render('signup.hbs', {
        title: 'Sign up',
        h1: 'Sign up',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        pages: ['/login',  '/', '/auth/facebook'],
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
        pages: ['/login',  '/', '/auth/facebook'],
        isError: 'true',
        error: 'User already exists.'
    });
});


app.post('/signup', (req, res)=> {
    var user = new User ({
        local:{
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            registration_date: today
        }
    });

    mongoose.model('users').find({$or:[{'local.username':req.body.username},{'local.email':req.body.email}]},(err,doc)=>{
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



// app.get('/aaa', (req, res)=>{
//     mongoose.model('users').find({},(err,users)=>{
//         res.send(users);
//     });
// });

app.get('/profile/:username', function(req, res) {
    mongoose.model('users').find({'local.username': req.params.username},(err,user)=>{
        if (err) {
            res.send('User does not exist.');
        }
        if (user.length ===0){
            mongoose.model('users').find({'facebook.username': req.params.username},(err,user)=>{
                if (err){
                    res.send('User does not exist.');
                }else{
                    res.render('profile.hbs', {
                        title: 'Profile',
                        username: user[0].facebook.username,
                        name: user[0].facebook.first_name + " " + user[0].facebook.last_name,
                        email: 'Not available',
                        link:'/'
                    });
                }

            });
        }else{
            res.render('profile.hbs', {
                title: 'Profile',
                username: user[0].local.username,
                name: user[0].local.first_name + " " + user[0].local.last_name,
                email: user[0].local.email,
                link:'/'
            });
        }

    });
});


app.get('/account',(req,res)=> {
    if (req.user.local.username){
        var username = req.user.local.username;
        var email = req.user.local.email;
        var name = req.user.local.first_name + " " + req.user.local.last_name;
        var updatelink = '/account/update'
    }else if (req.user.facebook.username){
        var username = req.user.facebook.username;
        var email = 'Not available';
        var name = req.user.facebook.first_name + " " + req.user.facebook.last_name;
        var updatelink = '/account/fb_update'
    }

    res.render('account.hbs',{
        title: 'ChatterBox',
        link: ['/chatroom','/logout'],

        username: `${username}`,
        email: `${email}`,
        name: `${name} `,
        updateLink:`${updatelink} `

    })
});

app.get('/account/update',(req,res)=>{
    var username = req.user.local.username;
    var email = req.user.local.email;
    var first_name = req.user.local.first_name;
    var last_name = req.user.local.last_name;

    res.render('update.hbs', {
        title: 'Update Account',
        h1: 'Update Account',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        username: `${username}`,
        email: `${email}`,
        first_name: `${first_name}`,
        last_name: `${last_name}`,
        link: '/account',
        isError: 'false',
        error: ''
    });
});

app.get('/account/update/exists', (req, res)=> {

    var username = req.user.local.username;
    var email = req.user.local.email;
    var first_name = req.user.local.first_name;
    var last_name = req.user.local.last_name;

    res.render('update.hbs', {
        title: 'Update Account',
        h1: 'Update Account',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        box4: 'password',
        box5: 'email',
        username: `${username}`,
        email: `${email}`,
        first_name: `${first_name}`,
        last_name: `${last_name}`,
        link: '/account',
        isError: 'true',
        error: 'User already exists.'
    });
});

app.post('/account/update-form', (req, res)=>{
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = bcrypt.hashSync(req.body.password);
    var username = req.body.username;

    var user = new User ({
        local:{
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
            email: email,
            registration_date: req.user.local.registration_date
        }
    });


    mongoose.model('users').find({$or:[{'local.username':username},{'local.email':username}, {'facebook.username':username}]},(err,doc)=>{
        if (err){
            res.send('Unable to add user.');
        }
        if (doc.length===0 || doc[0]._id.equals(req.user._id)){
            mongoose.model('users').updateOne({_id: req.user._id}, {
                $set:{
                    'local.username': username,
                    'local.password': password,
                    'local.first_name': first_name,
                    'local.last_name': last_name,
                    'local.email': email,
                    'local.registration_date': req.user.local.registration_date

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

app.get('/account/fb_update',(req,res)=>{
    var username = req.user.facebook.username;
    var email = 'Not available';
    var first_name = req.user.facebook.first_name;
    var last_name = req.user.facebook.last_name;

    res.render('update_fb.hbs', {
        title: 'Update Account',
        h1: 'Update Account',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        username: `${username}`,
        first_name: `${first_name}`,
        last_name: `${last_name}`,
        link: '/account',
        isError: 'false',
        error: ''
    });
});

app.get('/account/fb_update/exists', (req, res)=> {

    var username = req.user.facebook.username;
    var first_name = req.user.facebook.first_name;
    var last_name = req.user.facebook.last_name;

    res.render('update_fb.hbs', {
        title: 'Update Account',
        h1: 'Update Account',
        box1: 'username',
        box2: 'first_name',
        box3: 'last_name',
        username: `${username}`,
        first_name: `${first_name}`,
        last_name: `${last_name}`,
        link: '/account',
        isError: 'true',
        error: 'User already exists.'
    });
});

app.post('/account/update-form-fb', (req, res)=>{
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var username = req.body.username;

    var user = new User ({
        facebook:{
            id: req.user.facebook.id,
            token: req.user.facebook.token,
            first_name: first_name,
            last_name: last_name,
            username: username,
            registration_date: req.user.facebook.registration_date
        }
    });


    mongoose.model('users').find({$or:[{'local.username':username},{'facebook.username':username}]},(err,doc)=>{
        if (doc.length===0 || doc[0]._id.equals(req.user._id)){
            mongoose.model('users').updateOne({_id: req.user._id}, {
                $set:{
                    'facebook.username': username,
                    'facebook.first_name': first_name,
                    'facebook.last_name': last_name,
                    'facebook.registration_date': req.user.facebook.registration_date
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
            res.redirect('/account/fb_update/exists');
        }

    });

});

app.get('/logout', (req, res)=> {
    var username;
    if (req.user.local){
        username = req.user.local.username;
    }else if (req.user.facebook){
        username = req.user.facebook.username;
    }

    var index = clients.indexOf(username);
    if (index > -1) {
        clients.splice(index, 1);
    }
    req.logout();
    res.redirect("/");
});

app.get('/chatroom', ensureAuthenticated,(req, res)=> {
    var username;
    if (req.user.local.username){
        username = req.user.local.username;
        clients.push(username);
    }
    if (req.user.facebook.username){
        username = req.user.facebook.username;
        clients.push(username);
    }

    res.render('chat.hbs', {
        title: 'ChatterBox',
        page: 'Log out',
        link: ['/logout','/account'],
        username: `${username}`
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