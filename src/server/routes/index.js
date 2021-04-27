
const express = require('express');

const router = express.Router();
const passport = require('passport');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// for password reset
var async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const node = require('deasync');
var async = require('async');
const User = require('../models/user');
const TenantRequest = require('../models/listing/tenant_request');
const LandlordRequest = require('../models/listing/landlord_request');

const { jwtOptions } = require('../utilities/jwt_utilities');

node.loop = node.runLoopOnce;

module.exports = function (app) {
  router.get('/getLoginStatus', (req, res) => {
    if (req.user == undefined) {
      console.log(' user is undefined');
    } else {
      // console.log(`getLoginStatus called with username = ${req.user.username}`);
      // console.log(`${JSON.stringify(app.locals.currentUser[req.user.username])}`);
    }
    if (req.user == undefined) res.json(null);
    else
    if (app.locals.currentUser[req.user.username] == undefined) {
      res.json(null);
    } else {
      res.json(app.locals.currentUser[req.user.username]);
    }
  });

  router.get('/getLastMenu', (req, res) => {
    console.log('getLastMenu called');
    res.json(app.locals.lastReactMenu);
    app.locals.lastReactMenu = '';
  });

  router.post('/getLoginStatus', (req, res) => {
    if (req.body.username == undefined) {
      console.log(' user is undefined');
    } else {
      console.log(`getLoginStatus called with username = ${req.body.username}`);
    }

    if (req.body.username == undefined) res.json(null);
    else res.json(app.locals.currentUser[req.body.username]);
  });

  router.get('/getData', (req, res) => {
    // read listing information from database.
    LandlordRequest.find({}).populate('requester', 'username profile_picture').then((listings) => {
      res.send(listings);
    });
  });

  router.get('/about', (req, res) => {
    app.locals.lastReactMenu = 'dashboard';
    res.redirect('/');
  });

  router.get('/map', (req, res) => {
    console.log('justin debug');
    app.locals.lastReactMenu = 'map';
    res.redirect('/');
  });

  router.get('/landing', (req, res) => {
    console.log('called landing page');
    res.render('landing');
  });

  router.get('/react_login', (req, res) => {
    console.log('react_login called');
    res.render('react_login');
  });

  router.get('/facebook_login', (req, res) => {
    res.render('facebook_login');
  });
  // show sign-up form
  router.get('/signup', (req, res) => {
    res.render('signup');
  });

  router.post('/updatePushToken', (req, res) => {
    if (req.user != null) {
      const currUserName = req.user.username;
      const userId = req.user._id;

      //console.log(`Update push token for user: ${currUserName}, token: ${req.body.token}`);
      User.findById(userId, (err, foundUser) => {
        foundUser.expoPushToken = req.body.token;
        foundUser.save();
        res.send({ result: 'successful updatePushToken' });
      });
    } else {
      res.send({ result: 'user it not logged in' });
    }
  });

  // handle sign up logic
  router.post('/signup', (req, res) => {
    const birthdayString = `${req.body.year}-${req.body.month}-${req.body.day}`;
    const newUser = new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      name: `${req.body.lastname} ${req.body.firstname}`,
      email: req.body.email,
      gender: req.body.gender,
      password: req.body.password,
      birthdate: new Date(birthdayString)
    });


    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        req.flash('error', err.message);
        return res.render('signup');
      }
      // how to use facebook login?
      passport.authenticate('local')(req, res, () => {
        req.flash('success', `Welcome to LinkedSpaces ${user.username}`);
        // Why is it not called?
        user.loggedInTime = Date.now();
        user.save();
        res.redirect('/');
      });
    });
  });
  // hanle log-out
  router.get('/logout', (req, res) => {
    if (req.user != null) {
      const currUserName = req.user.username;
      const userId = req.user._id;

      console.log(`Logging out: username = ${currUserName}`);
      app.locals.currentUser[currUserName] = null;
      req.logout();

      User.findById(userId, (err, foundUser) => {
        foundUser.loggedInTime = null;
        foundUser.save();
        console.log(`Clearing app.locals.currentUser[${currUserName}] to null`);
        // res.redirect('/');
        res.send({ result: 'successful logout' });
      });
    } else {
      // req.flash('success', 'Logged you out!');
      res.send({ result: 'successful logout' });
      // res.redirect('/');
    }
  });

  // show login form
  router.get('/login', (req, res) => {
    console.log('login called');

    res.render('login');
  });


  // handling login logic
  router.post('/login', (req, res) => {
    // it's not called
    passport.authenticate('local')(req, res, (error) => {
      if (error) {
        res.redirect('/');
        done();
      } else {
        req.flash('success', `Welcome back to LinkedSpaces ${req.body.username}`);
        res.redirect('/');
        User.findOne({ username: req.body.username }).populate('direct_friends', 'profile_picture email username name loggedInTime').exec((err, user) => {
          user.loggedInTime = Date.now();
          user.save();
          if (err) { console.log('User Not Found'); return; }
          app.locals.currentUser[req.user.username] = user;
          app.locals.profile_picture = user.profile_picture;
        });
      }
    });
  });

  router.get('/test_jwt', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.warn(`user=${JSON.stringify(req.user)}`);
    res.json({ message: 'Success! you can not see this without a token' });
  });

  router.post('/jwt_login', (req, res) => {
    // it's not called
    passport.authenticate('local')(req, res, (error) => {
      if (error) {
        console.warn('authentication failure');
        res.status(401).json({ message: 'passwords did not match', token: null });
        done();
      } else {
        console.warn('authentication success');
        User.findOne({ username: req.body.username }).populate('direct_friends', 'profile_picture email username name loggedInTime').exec((err, user) => {
          user.loggedInTime = Date.now();
          user.save();
          if (err) { console.warn('User Not Found'); return; }
          app.locals.currentUser[req.user.username] = user;
          app.locals.profile_picture = user.profile_picture;

          const payload = { id: user.id };
          const token = jwt.sign(payload, jwtOptions.secretOrKey);

          res.json({ message: 'ok', token });
        });
      }
    });
  });


  router.get('/homepage', (req, res) => {
    res.render('homepage');
  });
  // forgot password
  router.get('/forgot', (req, res) => {
    res.render('forgot');
  });

  router.post('/forgot', (req, res, next) => {
    // Runs an array of functions in series, each passing their results to the next in the array.
    // However, if any of the functions pass an error to the callback, the next function is not executed and
    // the main callback is immediately called with the error.
    async.waterfall([
      // it's very interesting... done is not input but output for the next function?
      // what is this token for?
      function (done) {
        crypto.randomBytes(20, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      // save token to User database
      function (token, done) {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save((err) => {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        /*
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'linkedspaces.seo@gmail.com',
            pass: '!taylormade0320'
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'linkedspaces.seo@gmail.com',
          subject: 'LinkedSpaces - Password Reset',
          text: `${'You are receiving this because you have requested the reset of the password for your account.\n\n'
            + 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
            + 'https://'}linkedspaces.herokuapp.com/LS_API/reset/${token}\n\n`
            + 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          console.log(`mail sent to ${user.email}`);
          req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
          done(err, 'done');
        }); */
        res.json({ token, username: user.username });
      }
    ], (err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  router.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', { token: req.params.token });
    });
  });

  router.post('/reset/:token', (req, res) => {
    async.waterfall([
      function (done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if (req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, (err) => {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
              user.save((err) => {
                req.logIn(user, (err) => {
                  done(err, user);
                });
              });
            });
          } else {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('back');
          }
        });
      },
      function (user, done) {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'linkedspaces.seo@gmail.com',
            pass: '!taylormade0320'
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'linkedspaces.seo@gmail.com',
          subject: 'Your password has been changed',
          text: `${'Hello,\n\n'
            + 'This is a confirmation that the password for your account '}${user.email} has just been changed.\n`
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], (err) => {
      res.redirect('/');
    });
  });

  return router;
  // module.exports = router;
};
