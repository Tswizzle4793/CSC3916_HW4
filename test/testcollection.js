let envPath = __dirname + "/../.env"
require('dotenv').config({path:envPath});
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../Users');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'test3',
    username: 'email@email.com',
    password: '123@abc'
}

describe('Register, Login and Call Test Collection with Basic Auth and JWT Auth', () => {
   beforeEach((done) => { //Before each test initialize the database to empty
       //db.userList = [];

       done();
    })

    after((done) => { //after this test suite empty the database
        //db.userList = [];
        User.deleteOne({ name: 'test'}, function(err, user) {
            if (err) throw err;
        });
        done();
    })

    //Test the GET route
    describe('/signup', () => {
        it('it should register, login and check our token', (done) => {
         /* chai.request(server)
              .post('/signup')
              .send(login_details)
              .end((err, res) =>{
                console.log(JSON.stringify(res.body));
                res.should.have.status(200);
                res.body.success.should.be.eql(true);*/
                //follow-up to get the JWT token
                chai.request(server)
                    .post('/signin')
                    .send(login_details)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('token');
                        let token = res.body.token;
                        console.log(token);
                        done();
                    })
              })
       // })
    });

   /*let movie_details =
       {

            title: 'test get movie',
            year: '3009',
            genre: 'Comedy',
            actorOne: "'Jane Doe','Jane Character'",
            actorTwo: "'John Doe','John Character'",
            actorThree: "'James Lastname','James Charactername'"
       }

    describe('/movie', () => {
        it('it should add a movie', (done) => {
            chai.request(server)
                .post('/movie')
                .send(movie_details)
                .end((err, res) =>{
                    console.log(JSON.stringify(res.body));
                    //res.should.have.status(200);
                    //res.body.success.should.be.eql(true);
                    done();
                })
        })
    });*/
    /*let update_movie =
        {
            title: 'test movie the second one',
            year: '1100',
            genre: 'Adventure',
            actorOne: "'test actor','test character'"
        }
        describe('/movie', () =>{
            it('should update a movie', (done) =>{
                chai.request(server)
                    .put('/movie')
                    .send(update_movie)
                    .end((err, res) =>{
                    console.log(JSON.stringify(res.body));
                    done();
                })
            })
        });*/
    /*let delete_movie ={
        title: 'another test movie'

    }
    describe('/movie', () =>{
        it("should delete a movie", (done) =>{
            chai.request(server)
                .delete('/movie')
                .send(delete_movie)
                .end((err, res) =>{
                    console.log(JSON.stringify(res.body));
                    done();
                })
        })
    });*/
    let get_movie ={
        title: "test get movie",
        year:2000
    }

    describe('/movie', () =>{
        it("should get a movies", (done) =>{
            chai.request(server)
                .get('/movie')
                .send(get_movie)
                .end((err,res) =>{
                    console.log(JSON.stringify(res.body));
                    done();
                })
        })
    });

});
