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
    //if(!req.body.title){
      //  res.json({success: false, msg: 'Please add the title of the movie you want to get'})
    //}
    //else{
        Movie.find({},
            {_id:0,title:1, year:1, genre:1, actorOne:1, actorTwo:1, actorThree:1}, function(err,movie){
            if(err) res.json(err)
            res.json({success: true, msg: movie})
        })
    //}
})

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


