var chai = require('chai');
var chaiHttp = require('chai-http');
// var req = require('supertest');
const app = require('../server');

chai.use(chaiHttp);
let should = chai.should();
    describe('homepage', ()=>{
        it('should show the homepage', (done)=>{
            req(app).get('/')
                .end((err, res)=>{
                    res.should.have.status(200);
                    done();
                });
        });
    });
