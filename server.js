/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Reviews = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

//post save a movie
router.post('/movie',function(req,res){


    if ( !req.body.actorOne || !req.body.actorTwo || !req.body.actorThree) {
        res.json({success: false, msg: 'Please include at least three actors to add a movie'})
    }
    else if(!req.body.title || !req.body.year || !req.body.genre){
        res.json({success: false, msg: 'Please add a title, year, and genre to add a movie'})
    }
    else {

        Movie.findOne({title: req.body.title}, function (err, movie) {
            if (err) res.json(err)//console.log(err);
            if (movie) {
                res.json({success: false, msg: "Movie with title already exists"});
            } else {
                var newMovie = new Movie();
                newMovie.title = req.body.title;
                newMovie.year = req.body.year;
                newMovie.genre = req.body.genre;
                newMovie.actorOne = req.body.actorOne;
                newMovie.actorTwo = req.body.actorTwo;
                newMovie.actorThree = req.body.actorThree;

                newMovie.save(function (err, newMovie) {
                    if (err) res.send(err);
                    res.json({success: true, msg: "Movie Added"})
                });
            }
        });
    }

});
//put updates a movie

router.put('/movie', function(req,res){
    if(!req.body.title){
        res.json({success: false, msg: 'Please add the title of the movie you want to update'})
    }
    else{
        Movie.findOne({title: req.body.title}, function (err, movie){
            if(err) res.json(err)
            if(movie){
                Movie.updateOne(movie, req.body, function(err) {
                    if (err) res.json(err)
                    res.json({success: true, msg: "Movie Updated"});
                })
            }
        })
    }
})

//delete deletes a movie

router.delete('/movie', function(req, res){

    if(!req.body.title){
        res.json({success: false, msg: 'Please add the title of the movie you want to delete'})
    }
    else{
        Movie.findOne({title: req.body.title}, function(err,movie){
            if(err) res.json(err)
            if(movie){
                Movie.deleteOne({title: req.body.title}, function(err){
                    if(err) res.json(err)
                    res.json({success: true, msg: "Movie Deleted"});
                })
            }
        })
    }
});

//get gets a movie
router.get('/movie', function(req,res){
    console.log("in the movie route before the timeout");
    if(req.query.title === undefined) {
        console.log("in the undefined if");
        Movie.find({},
            {_id: 0, title: 1, year: 1, genre: 1, actorOne: 1, actorTwo: 1, actorThree: 1}, function (err, movie) {
                if (err) res.json(err)
                res.json({success: true, msg: movie})
            })
    }
    else if(req.query.review === undefined){
        console.log("review doesnt exist else if");
        Movie.findOne({title: req.query.title},
            {_id: 0, title: 1, year: 1, genre: 1, actorOne: 1, actorTwo: 1, actorThree: 1}, function (err, movie) {
                if (err) res.json(err)
                res.json({success: true, msg: movie})
            })
    }
    else if(req.query.review === true){
        console.log("got to the else if with the review query thing")
        var result = Movie.aggregate([
            {
                $lookup:
                    {
                        from: "reviews",
                        localField: "title",
                        foreignField: "title",
                        as: "movie_reviews"
                    }

            }
        ]);
        res.json({test: result});
    }
    console.log("got to the bottom");
})


router.post('/reviews', function(req,res){

    //no error checking at this point
    var newReview = new Reviews();
    var userToken = req.body.token;
    userToken = userToken.split('.')[1];
    //console.log("only the middle part     " + userToken +"   end of token");
    var userData = atob(userToken);
    //console.log("decoded user data  <><><>  " + userData);
    var jsonUserData = JSON.parse(userData);

    newReview.title = req.query.title; //this is what will be used to track what movie the review belongs to
    newReview.name = jsonUserData.username;
    newReview.review = req.body.review;
    newReview.rating = req.body.rating;

    newReview.save(function(err, newReview) {
        if(err) res.send(err);
        res.json({success: true, msg: "Review Added"})
    });

})



app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


