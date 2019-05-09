const chai = require('chai');
const expect = require('chai').expect;
const assert = require('chai').assert;
const chaiHttp = require('chai-http');
const should = chai.should();
var   io = require('socket.io-client')
    , ioOptions = {
    transports: ['websocket']
    , forceNew: true
    , reconnection: false
}
    , testMsg = 'HelloWorld'

// const app = require('../server');
// const request = require("supertest");


chai.use(chaiHttp);

describe("SAMPLE unit test",function(){
    it("should return home page", (done)=>{

        chai.request("http://localhost:8080")
            .get("/")
            .end((err,res)=>{
                should.exist(res.body);
                console.log(res);
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
            .send({username: "op", password:"Kucing07!"})
            // .send({username: "chowzler", password:"Asdf1234"})
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/chatroom");
                done();
            });
    });
    it("should not login to chatroom", (done)=>{

        chai.request("http://localhost:8080")
            .post("/login")
            .send({username: "rawr", password:"Kucing07!"})
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("http://localhost:8080/login/incorrect");
                done();
            });
    });


    it("should sign up a user", (done)=>{
        let json ={};
        json.username= "www";
        json.password = "111";
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

    })
    it("should get chatroom", (done)=>{
        chai.request("http://localhost:8080")
            .get("/chatroom")
            .end((err,res)=>{
                // should.exist(res.body);
                res.should.have.status(200);
                done();
            });
    });
    /* ---------------------------Deliverable 1 Tests----------------*/
    var agent = chai.request.agent("http://localhost:8080")
    it("should get user account information", (done)=>{
        agent
            .post("/login")
            .send({username: "op", password:"Kucing07!"})
            // .send({_method:"post", username: "chowzler", password:"Asdf1234"})
            .then(function(){
                // res.should.have.cookie('sessionid');
                return agent.get('/account')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        done()
                    });
            })
        // agent.close()
    });

    var agent = chai.request.agent("http://localhost:8080")
    it("should update profile", (done)=>{
        agent
            .post("/login")
            .send({username: "op", password:"Kucing07!"})
            .then(function(){
                return agent.post('/account/update-form')
                   .send({_method:"post", username: "chowzler", password:"Asdf1234"})
                    .then(function(res){
                    return agent.get('/account/update')
                    .send({
                        _method:"post",
                        last_name:"Olivia",
                        first_name:"Olivia",
                        username:"opangkiey",
                        password:"Kucing07!",
                        email: "a@gmail.com"})
                    .then(function(){
                        return agent.get('/account')
                            .then(function (res) {
                                expect(res).to.have.status(200);
                                // console.log(res);
                                // assert.equal(res.body.user[0].username,'op');
                                // assert.equal(res.body.user[0].name,'OliviaPangkiey');
                                // assert.equal(res.body.user[0].email,'a@gmail.com');
                                done()
                            }).catch(function(err){
                                console.log(err)
                        });
                                console.log(res);
                                done()
                            });

                    })


            })
    });

    var agent = chai.request.agent("http://localhost:8080")
    it("should NOT update profile", (done)=>{
        agent
            .post("/login")
            .send({_method:"post", username: "chowzler", password:"Asdf1234"})
            .then(function(res){
                return agent.get('/account/update')
                    .send({
                        _method:"post",
                        last_name:"Olivia",
                        first_name:"Olivia",
                        username:"chowzler",
                        password:"Asdf1234",
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
    /* ---------------------------Deliverable 2 Tests----------------*/



});






// chai.use(chaiHttp);
// chai.should()
// var agent = chai.request.agent(app);
// describe("SAMPLE unit test",function(){
//     it("should return home page", (done)=>{
//         // chai.request(app)
//         agent
//             .get("/")
//             .end((err,res)=>{
//                 should.exist(res.body);
//                 console.log(res.body);
//                 expect(res).to.have.status(200);
//                 done();
//             });
//     });
// });
//
// // var agent = chai.request.agent(app);
// describe("SAMPLE unit test",function(){
//     it("should return login page", (done)=>{
//         chai.request(app)
//         // agent
//             .get("/login")
//             .end((err,res)=>{
//                 should.exist(res.body);
//                 res.should.have.status(200);
//                 done();
//             });
//     });
// });
//

//
// var agent = chai.request.agent(app);
// describe("SAMPLE unit test",function(done){
//     it("should go to chatroom", ()=>{
//         chai.request(app);
//         agent
//             .post("/login")
//             .send({username: "opangkiey", password:"Kucing07!"})
//             // .end((err,res)=>{
//             //     should.exist(res.body);
//             //     res.should.redirectTo("/chatroom");
//             //     done();
//             // });
//     });
// });
