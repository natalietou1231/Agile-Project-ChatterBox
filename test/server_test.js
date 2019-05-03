// var mocha = require('mocha');
// var describe = mocha.describe;
// var it = mocha.it;
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('../server');
const request = require("supertest");
// const should = require("should");
// const server = supertest.agent("http://localhost:8080");

chai.use(chaiHttp);
var agent = chai.request.agent(app);
describe("SAMPLE unit test",function(done){
    it("should return home page", ()=>{
        chai.request(app);
        agent
            .get("/")
            .end((err,res)=>{
                should.exist(res.body);
                res.should.have.status(200);
                done();
            });
    });
});

var agent = chai.request.agent(app);
describe("SAMPLE unit test",function(done){
    it("should return login page", ()=>{
        chai.request(app);
        agent
            .get("/login")
            .end((err,res)=>{
                should.exist(res.body);
                res.should.have.status(200);
                done();
            });
    });
});

var agent = chai.request.agent(app);
describe("SAMPLE unit test",function(done){
    it("should go to chatroom", ()=>{
        chai.request(app);
        agent
            .post("/login")
            .send({username: "opangkiey", password:"Kucing07!"})
            .end((err,res)=>{
                should.exist(res.body);
                res.should.redirectTo("/chatroom");
                done();
            });
    });
});