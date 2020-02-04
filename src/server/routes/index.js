var express = require("express");
var app   = express();
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var fileUpload = require('express-fileupload');
// for password reset
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
router.get("/getLoginStatus", function(req, res){
  var isUserLoggined = (req.user) ? "true": "false";
  console.log("getLoginStatus called. status = " + isUserLoggined);
  res.json(isUserLoggined);
});
router.get("/getLastMenu", function(req, res){
  console.log("getLastMenu is called");
  res.json(app.locals.lastReactMenu);
  app.locals.lastReactMenu = "";
});

router.get("/", function(req, res){
 res.render("landing");
});
router.get("/about", function(req, res){
  app.locals.lastReactMenu = "dashboard";
  res.redirect("/");
});
router.get("/map", function(req, res){
  app.locals.lastReactMenu = "map";
  res.redirect("/");
});
router.get("/landing", function(req, res){
  console.log("called landing page");
  res.render("landing");
});
router.get("/react_login", function(req, res){
  res.render("react_login");
});
router.get("/facebook_login", function(req, res){
  res.render("facebook_login");
});
// show sign-up form
router.get("/signup", function(req, res){
  res.render("signup");
});

//handle sign up logic
router.post("/signup", function(req, res){
 var birthdayString = req.body.year+"-"+req.body.month+"-"+req.body.day;
 var newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
                          lastname: req.body.lastname,
                          email: req.body.email,
                          gender: req.body.gender,
                          birthdate: new Date(birthdayString)
                          });
  User.register(newUser, req.body.password, function(err, user){
      if(err){
          req.flash("error", err.message);
          return res.render("signup");
      }
      // how to use facebook login?
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to LinkedSpaces " + user.username);
        res.redirect("/");
      });
  });
});
//hanle log-out
router.get("/logout", function(req,res){
 req.logout();
 req.flash("success", "Logged you out!");
 res.redirect("/");
});
//show login form
router.get("/login", function(req, res){
   res.render("login");
});
//handling login logic
router.post("/login", passport.authenticate("local",
  {
      successRedirect: "/homepage",
      failureRedirect: "/"
  }), function(req, res){
});
router.get("/homepage", function(req,res){
 res.render("homepage");
});
// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});
router.post('/forgot', function(req, res, next) {
  // Runs an array of functions in series, each passing their results to the next in the array.
  // However, if any of the functions pass an error to the callback, the next function is not executed and
  // the main callback is immediately called with the error.
  async.waterfall([
  // it's very interesting... done is not input but output for the next function?
  // what is this token for?
  function(done) {
    crypto.randomBytes(20, function(err, buf) {
      var token = buf.toString('hex');
      done(err, token);
    });
  },
  // save token to User database
  function(token, done) {
    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot');
      }
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      user.save(function(err) {
        done(err, token, user);
      });
    });
  },
  function(token, user, done) {
    var smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'inseo.kr@gmail.com',
        pass: '!newintern0320'
      }
    });
    var mailOptions = {
      to: user.email,
      from: 'inseo.kr@gmail.com',
      subject: 'Node.js Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      console.log('mail sent');
      req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
      done(err, 'done');
    });
  }
  ], function(err) {
  if (err) return next(err);
  res.redirect('/forgot');
  });
});
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot');
  }
  res.render('reset', {token: req.params.token});
  });
});
router.post('/reset/:token', function(req, res) {
  async.waterfall([
  function(done) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('back');
      }
      if(req.body.password === req.body.confirm) {
        user.setPassword(req.body.password, function(err) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        })
      } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
      }
    });
  },
  function(user, done) {
    var smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'inseo.kr@gmail.com',
        pass: '!newintern0320'
      }
    });
    var mailOptions = {
      to: user.email,
      from: 'inseo.kr@mail.com',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      req.flash('success', 'Success! Your password has been changed.');
      done(err);
    });
  }
  ], function(err) {
  res.redirect('/');
  });
});
module.exports = router;
