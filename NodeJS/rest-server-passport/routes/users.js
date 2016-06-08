var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

/* GET users listing. */
router.route('/')
        .get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
            User.find({}, function (err, user) {
                if (err)
                    throw err;
                res.json(user);
            });
        });

router.post('/register', function (req, res) {
    User.register(new User({username: req.body.username}),
            req.body.password, function (err, user) {
                if (err) {
                    return res.status(500).json({err: err});
                }
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(function (err, user) {
                    passport.authenticate('local')(req, res, function () {
                        return res.status(200).json({status: 'Registration Successful!'});
                    });
                });
            });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback',
        passport.authenticate('facebook', {session: false, failureRedirect: "/"}),
        function (req, res) {
            
            res.redirect("/users/profile?access_token=" + req.user.OauthToken);
           
        }
);

router.get(
        '/profile',
        passport.authenticate('bearer', {session: false}),
        function (req, res) {
           // console.log(req.query.callback);
            // res.send("LOGGED IN as " + req.user.OauthId + " - <a href=\"/logout\">Log out</a>");
            var token = Verify.getToken(req.user);
            res.header("Content-Type", "application/javascript");
            var retObj = {
                status: 'Login successful!',
                success: true,
                token: token
            };
            res.status(200).send('angular.callbacks._0('+JSON.stringify(retObj)+');');
        }
);
/*
 router.get('/facebook/callback', function (req, res, next) {
 passport.authenticate('facebook', function (err, user, info) {
 if (err) {
 return next(err);
 }
 if (!user) {
 return res.status(401).json({
 err: info
 });
 }
 req.logIn(user, function (err) {
 if (err) {
 return res.status(500).json({
 err: 'Could not log in user'
 });
 }
 var token = Verify.getToken(user);
 res.status(200).json({
 status: 'Login successful!',
 success: true,
 token: token
 });
 });
 })(req, res, next);
 });
 */
module.exports = router;