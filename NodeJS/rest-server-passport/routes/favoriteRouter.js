var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
        .all(Verify.verifyOrdinaryUser)

        .get(function (req, res, next) {
            Favorites.find({})
                    .populate('postedBy dishes')
                    .exec(function (err, favorite) {
                        if (err)
                            throw err;
                        res.json(favorite);
                    });
        })

        .post(function (req, res, next) {
            Favorites.findOne({postedBy: req.decoded._doc._id}, function (err, favorite) {
                if (err)
                    throw err;
                if (favorite) {
                    favorite.dishes.push(req.body);
                    favorite.save(function (err, favorite) {
                        if (err)
                            throw err;
                        console.log('Updated dishes for this user\'s favorites!');
                        res.json(favorite);
                    });
                } else {
                    var tobeSaved = {};
                    tobeSaved.postedBy = req.decoded._doc._id;
                    tobeSaved.dishes = [req.body];
                    Favorites.create(tobeSaved, function (err, favorite) {
                        if (err)
                            throw err;
                        console.log('Favorite created!');
                        var id = favorite._id;
                        res.writeHead(200, {
                            'Content-Type': 'text/plain'
                        });

                        res.end('Added the favorite with id: ' + id);
                    });
                }
            });


        })

        .delete(function (req, res, next) {
            Favorites.remove({postedBy: req.decoded._doc._id}, function (err, resp) {
                if (err)
                    throw err;
                res.json(resp);
            });
        });

favoriteRouter.route('/:favoriteId')
        .all(Verify.verifyOrdinaryUser)

        .get(function (req, res, next) {
            Favorites.findById(req.params.favoriteId)
                    .populate('postedBy dishes')
                    .exec(function (err, favorite) {
                        if (err)
                            throw err;
                        res.json(favorite);
                    });
        })

        .put(function (req, res, next) {
            Favorites.findById(req.params.favoriteId, function (err, favorite) {
                if (err)
                    throw err;
                if (favorite.postedBy != req.decoded._doc._id) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }

                Favorites.findByIdAndUpdate(req.params.favoriteId, {
                    $set: req.body
                }, {
                    new : true
                }, function (err, favorite) {
                    if (err)
                        throw err;
                    res.json(favorite);
                });

            });


        })

        .delete(function (req, res, next) {
            Favorites.findById(req.params.favoriteId, function (err, favorite) {
                if (err)
                    throw err;
                if (favorite.postedBy != req.decoded._doc._id) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }

                Favorites.findByIdAndRemove(req.params.favoriteId, function (err, resp) {
                    if (err)
                        throw err;
                    res.json(resp);
                });

            });

        });

favoriteRouter.route('/:favoriteId/dishes')
        .all(Verify.verifyOrdinaryUser)

        .get(function (req, res, next) {
            Favorites.findById(req.params.favoriteId)
                    .populate('postedBy dishes')
                    .exec(function (err, favorite) {
                        if (err)
                            throw err;
                        res.json(favorite.dishes);
                    });
        })

        .post(function (req, res, next) {
            Favorites.findById(req.params.favoriteId, function (err, favorite) {
                if (err)
                    throw err;
                if (favorite.postedBy != req.decoded._doc._id) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }

                favorite.dishes.push(req.body);
                favorite.save(function (err, favorite) {
                    if (err)
                        throw err;
                    console.log('Updated Dishes!');
                    res.json(favorite);
                });
            });
        })

        .delete(function (req, res, next) {
            Favorites.findById(req.params.favoriteId, function (err, favorite) {
                if (err)
                    throw err;
                if (favorite.postedBy != req.decoded._doc._id) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
                for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                    favorite.dishes.splice(i,1);
                }
                favorite.save(function (err, result) {
                    if (err)
                        throw err;
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Deleted all dishes!');
                });
            });
        });

favoriteRouter.route('/:favoriteId/dishes/:dishId')
        .all(Verify.verifyOrdinaryUser)

        .get(function (req, res, next) {
            Favorites.findById(req.params.favoriteId)
                    .populate('postedBy dishes')
                    .exec(function (err, favorite) {
                        if (err)
                            throw err;
                        if (!favorite.getDish(req.params.dishId)) {
                            var err = new Error('The dish you want to get does not exist!');
                            err.status = 403;
                            return next(err);
                        }
                        res.json(favorite.getDish(req.params.dishId));
                    });
        })

        .put(function (req, res, next) {
            // We delete the existing dish and insert the updated
            // dish as a new dish
            Favorites.findById(req.params.favoriteId, function (err, favorite) {
                if (err)
                    throw err;
                if (favorite.postedBy != req.decoded._doc._id) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
                if (!favorite.dishbyId(req.params.dishId)) {
                    var err = new Error('The dish you want to update does not exist!');
                    err.status = 403;
                    return next(err);
                }
                favorite.removeDishbyId(req.params.dishId);
                
                favorite.dishes.push(req.body);
                favorite.save(function (err, favorite) {
                    if (err)
                        throw err;
                    console.log('Updated Dishes!');
                    res.json(favorite);
                });
            });
        })

        .delete(function (req, res, next) {
            Favorites.findById(req.params.favoriteId, function (err, favorite) {
                if (favorite.postedBy != req.decoded._doc._id) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
                if (!favorite.dishbyId(req.params.dishId)) {
                    var err = new Error('The dish you want to delete does not exist!');
                    err.status = 403;
                    return next(err);
                }
               
                favorite.removeDishbyId(req.params.dishId);

                favorite.save(function (err, resp) {
                    if (err)
                        throw err;
                    res.json(resp);
                });
            });
        });
module.exports = favoriteRouter;

