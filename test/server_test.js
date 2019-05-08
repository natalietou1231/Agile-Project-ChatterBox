const chai = require('chai');
const expect = require('chai').expect;
const assert = require('chai').assert;
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
// const app = require('../server');
// const request = require("supertest");


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
            .send({username: "op123", password:"Kucing07!"})
            .end((err,res)=>{
                // should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/login/incorrect");
                done();
            });
    });
    it("should login to chatroom", (done)=>{

        chai.request("http://localhost:8080")
            .post("/login")
            .send({username: "www", password:"111111Rf"})
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/chatroom");
                done();
            });
    });

    it("should sign up a user", (done)=>{
        let json ={};
        json.username= "ddd";
        json.password = "11111Rf";
        json.first_name = "aaa";
        json.last_name = "ddd";
        json.email = "111@g.com";
        json.registration_date = new Date();

        chai.request("http://localhost:8080")
            .post("/signup")
            .send(json)
            .end((err,res)=>{
                should.exist(res.body);
                res.should.have.status(200);
                done();
            });

    });

    it("should not create user if email exists", (done)=>{
        let json ={};
        json.username= "ddd";
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

    it("should get chatroom", (done)=>{
        chai.request("http://localhost:8080")
            .get("/chatroom")
            .end((err,res)=>{
                should.exist(res.body);
                res.should.have.status(200);
                done();
            });
    });
    /* ---------------------------Deliverable 1 Tests----------------*/
    var agent = chai.request.agent("http://localhost:8080");
    it("should get user account information", ()=>{
        agent
            .post("/login")
            .send({username: "www", password:"111111Rf"})
            .then(function(){
                // res.should.have.cookie('sessionid');
                return agent.get('/account')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                    });
            })
        // agent.close()
    });

    it("should update profile", ()=>{
        agent
            .post("/login")
            .send({username: "www", password:"111111Rf"})
            .then(function(){
                return agent.post('/account/update-form')
                    .send({last_name:"Olivia",
                        first_name:"Olivia",
                        username:"www111",
                        password:"111111Rf",
                        email: "2@eer"})
                    .then(function(){
                        return agent.get('/account')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                assert.equal(res.body.user[0].username,'www111');
                                assert.equal(res.body.user[0].name,'OliviaOlivia');
                                assert.equal(res.body.user[0].email,'2@eer');

                            });

                    })


            })
    });

    it("should log out", ()=>{
        agent
            .post("/login")
            .send({username: "www", password:"111111Rf"})
            .then(()=>{
                return agent.get('/logout')
                    .then((err, res)=>{
                        expect(res).to.have.status(200);
                        expect(res).to.redirectTo("http://localhost:8080");

                    });


                    })


            })

});

