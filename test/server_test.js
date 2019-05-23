const chai = require('chai');
const expect = require('chai').expect;
const assert = require('chai').assert;
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');



chai.use(chaiHttp);

describe("SAMPLE unit test",function(){

    it("MongoDB connection", (done)=>{
        mongoose.connect('mongodb+srv://admin:112233444@cluster0-om2ow.mongodb.net/chatroom', { useNewUrlParser: true } , (error, result)=> {
            if (error){
                done(error);
                return;
            }
            assert.typeOf(result, 'object');
            done();
        });
    });

    it("should return home page", (done)=>{
        chai.request("http://localhost:8080")
            .get("/")
            .end((err,res)=>{
                should.exist(res.body);
                res.should.have.status(200);
                done();
            });
    });
    it("should not have access to chatroom", (done)=>{

        chai.request("http://localhost:8080")
            .post("/login")
            .send({_method: "post", username: "wrong-account", password:"Kucing07!"})
            .end((err,res)=>{
                res.should.redirectTo("http://localhost:8080/login/incorrect");
                done();
            });
    });


    it("should login to chatroom", (done)=>{

        chai.request("http://localhost:8080")
            .post("/login")
            .send({_method: "post", username: "tester1", password:"Asdf1234"})
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/chatroom");
                done();
            });
    });
    it("should not create user if email exists", (done)=>{
        let json ={};
        json.username= "zxcvbnmz";
        json.password = "11111Rf";
        json.first_name = "aaa";
        json.last_name = "ddd";
        json.email = "111@gmail.comqqq";
        json.registration_date = new Date();

        chai.request("http://localhost:8080")
            .post("/signup")
            .send(json)
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/signup/exists");
                done();
            });

    });

    it("should not create user if username exists", (done)=>{
        let json ={};
        json.username= "eee";
        json.password = "11111Rf";
        json.first_name = "aaa";
        json.last_name = "ddd";
        json.email = "aa@1";
        json.registration_date = new Date();

        chai.request("http://localhost:8080")
            .post("/signup")
            .send(json)
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/signup/exists");
                done();
            });

    });

    var agent = chai.request.agent("http://localhost:8080");
    it("should get chatroom", (done)=>{
        chai.request("http://localhost:8080")
        agent
            .post("/login")
            .send({_method:"post", username: "tester1", password:"Asdf1234"})
            .then(function(res){
                res.should.redirectTo("http://localhost:8080/chatroom");
                done()
            });
    });
//     /* ---------------------------Deliverable 1 Tests----------------*/

    var agent = chai.request.agent("http://localhost:8080");
    it("should get user account information", (done)=>{
        agent
            .post("/login")
            .send({_method:"post", username: "tester1", password:"Asdf1234"})


            .then(function(){
                return agent.get('/account')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        done();
                    });
            })
    });

    var agent = chai.request.agent("http://localhost:8080");
    it("should update profile", (done)=>{
        agent
            .post("/login")
            .send({_method:"post", username: "tester1", password:"Asdf1234"})
            .then(function(){
                return agent.post('/account/update-form')
                    .send({
                        last_name:"Olivia",
                        first_name:"Olivia",
                        username:"tester1",
                        password:"Asdf1234",
                        email: "2@gmail.com"})
                    .then(function(){
                        return agent.get('/account')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                done()
                            });

                    })

            })
    });
//
    var agent = chai.request.agent("http://localhost:8080");
    it("should log out", (done)=> {
        agent
            .post("/login")
            .send({_method: "post", username: "tester1", password: "Asdf1234"})
            .then(() => {
                return agent.get('/logout')
                    .then((err, res) => {
                        err.should.redirectTo("http://localhost:8080/");
                        done()
                    });
            })
    });

    var agent = chai.request.agent("http://localhost:8080");
    it("should NOT update profile password", (done)=>{
        agent
            .post("/login")
            .send({_method:"post", username: "tester1", password:"Asdf1234"})
            .then(function(res){
                return agent.get('/account/update')
                    .send({
                        _method:"post",
                        last_name:"Olivia",
                        first_name:"Olivia",
                        username:"tester1",
                        password:"1",
                        email: "a@gmail.com"})
                    .then(function(){
                        return agent.get('/account')
                            .then(function (res) {
                                expect(res).to.have.status(200);

                                done()
                            });
                    })
            })
    });
    var brows = chai.request.agent("https://afternoon-mesa-87220.herokuapp.com/");
    it("should be able to sign in with facebook", (done)=>{
        brows
            .get("/auth/facebook")
            .then(function(){
                return brows.get('chatroom')
                    .then(function (res, err) {
                        expect(res).to.have.status(200);
                        done();
                    })
                    // .catch(function(err){
                    //     console.log(err)
                    //     done()
                    // })
            })
    });

});


