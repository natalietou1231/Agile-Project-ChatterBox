const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
// const supertest = require("supertest");
// const should = require("should");
// const server = supertest.agent("http://localhost:8080");

chai.use(chaiHttp);

describe("SAMPLE unit test",function(){
    it("should return home page", done=>{

        chai.request("http://localhost:8080")
            .get("/")
            .end((err,res)=>{
                should.exist(res.body);
                res.should.have.status(200);
                done();
            });
    });
});