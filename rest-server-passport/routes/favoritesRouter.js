var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    Favorites.find({
    	postedBy: req.decoded._doc._id
    })
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorites) {
        if (err) throw err;
        res.json(favorites);
    });
})

.post(function (req, res, next) {
     Favorites.findOne({
        postedBy:req.decoded._doc._id 
    }) .exec(function (err, favorites) { 
        if (err) throw err;
        if(favorites) {
            if(favorites.dishes.indexOf(req.body._id) < 0){
                favorites.dishes.push(req.body);
                favorites.save(function (err, resp) {
                    if (err) throw err;
                    console.log('Dish added');
                    res.json(resp);
                });
            }
        }
        else {
            Favorites.create({
                postedBy:req.decoded._doc._id
            }, function (err, favorites) {
                if (err) throw err;
                console.log('Favorites created!');
                favorites.dishes.push(req.body);
                favorites.save(function (err, resp) {
                    if (err) throw err;
                    console.log('Dish added');
                    res.json(resp);
                });
            });
        } 
    });  
})

.delete(function (req, res, next) {
    Favorites.remove({
    	postedBy: req.decoded._doc._id
    }, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

favoritesRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({
        postedBy:req.decoded._doc._id
    })
        .exec(function (err, favorites) {
        if(favorites) {
            favorites.dishes.splice(favorites.dishes.indexOf(req.params.dishId), 1);
            favorites.save(function (err, resp) {
                if (err) throw err;
                    res.json(resp);
            });
        }
    });
});

module.exports = favoritesRouter;