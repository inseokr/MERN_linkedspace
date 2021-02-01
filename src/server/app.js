// testing heroku...
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook').Strategy;
const methodOverride = require('method-override');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');
const Axios = require('axios');

// JSON Web-Token stuffs
const _ = require('lodash');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const { ExtractJwt } = passportJWT;
const JwtStrategy = passportJWT.Strategy;

require('express-namespace');
const { fileUpload2Cloud, fileDeleteFromCloud } = require('./aws_s3_api');

const userDbHandler = require('./db_utilities/user_db/access_user_db');

const { jwtOptions } = require('./utilities/jwt_utilities');

const app = express();

app.namespace('/LS_API', () => {
  app.use(fileUpload());
  app.use(bodyParser());

  // routes
  const indexRoutes = require('./routes/index')(app);
  const listingRoutes = require('./routes/listing/index');
  const mynetworkRoutes = require('./routes/mynetwork/index')(app);
  const landlordRoutes = require('./routes/listing/landlord/index')(app);
  const tenantRoutes = require('./routes/listing/tenant/index')(app);
  const _3rdpartyRoutes = require('./routes/listing/3rdparty/index')(app);
  const profileRoutes = require('./routes/profile/index');
  const chattingRoutes = require('./routes/chatting/index')(app);

  const fs = require('fs');
  const path = require('path');
  const LandlordRequest = require('./models/listing/landlord_request');
  const TenantRequest = require('./models/listing/tenant_request');


  const facebook = require('./facebook.js');
  const nodemailer = require('nodemailer');
  const chatServer = require('./chatting_server');

  const cors = require('cors');

  const serverPath = './src/server';

  const parseurl = require('parseurl');
  const expressValidator = require('express-validator');
  // relocated the default view directory
  const viewPath = path.join(__dirname, 'views');

  const reactBase = 'C:/webdev/mern/MERN_linkedspace/src/client';

  const os = require('os');

  // 'mongodb://localhost/Linkedspaces';
  const url = process.env.DATABASEURL || process.env.DEV_DATABASEURL;

  console.log(`MongoDB URL = ${url}`);


  async function downloadProfilePicture(profileFullPath, profilePath, accessToken) {
    const url = `https://graph.facebook.com/me/picture?access_token=${accessToken}`;

    const writer = fs.createWriteStream(profileFullPath);

    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    fileUpload2Cloud(serverPath, profilePath);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async function createUserByFacebookProfile(facebookProfile, accessToken) {
    const splitedName = facebookProfile.name.split(' ');
    const profilePath = '/public/user_resources/pictures/profile_pictures/' + `${facebookProfile.id}.jpg`;
    const profileFullPath = path.resolve(__dirname, 'public/user_resources/pictures/profile_pictures', `${facebookProfile.id}.jpg`);
    const result = await downloadProfilePicture(profileFullPath, profilePath, accessToken);

    // console.log(`Profile picture download result = ${result}`);

    const newUser = new User({
      username: facebookProfile.email,
      firstname: splitedName[0],
      lastname: splitedName[1],
      email: facebookProfile.email,
      password: 'linkedspaces',
      profile_picture: profilePath
    });

    return new Promise((resolve, reject) => {
      User.register(newUser, 'linkedspaces', (err, user) => {
        resolve(user);
      });
    });
  }

  async function downloadImage() {
    // const url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true';
    const url = 'https://graph.facebook.com/me/picture?access_token=EAAOX3hjbtykBAFmQdG42jZAYewvVq0Vr5Bcsb6ZCs5VMDVPjNeZC8KwFZBJn7XleMtn3RLk8iC6rYuZCHLRQDpTwCCkIgUsr25asdQZBMyOgsK205NaZBagzfHYmI3PPKM1YBJFqzG8dgkJOQjb22TP4dUbeEo8g2gZD';
    const path_ = path.resolve(__dirname, 'images', 'code.jpg');
    const writer = fs.createWriteStream(path_);

    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }


  mongoose.connect(url, { useNewUrlParser: true });
  // app.use(bodyParser.urlencoded({extended: true}));


  app.set('view engine', 'ejs');
  app.set('views', viewPath);

  app.use(cors());

  app.use(express.static(`${__dirname}/public`));
  app.use(express.static(reactBase));

  app.use(methodOverride('_method'));
  app.use(flash());
  app.use(express.static('dist'));

  // app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));


  // PASSPORT CONFIGURATION
  app.use(require('express-session')({
    secret: 'anything',
    resave: false,
    saveUninitialized: false
  }));


  const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
    // It will be called only if the request contains the token.
    User.findById(jwt_payload.id).populate('direct_friends', 'profile_picture email username name loggedInTime').exec((err, foundUser) => {
      if (err) {
        console.warn('jwtStrategy failed');
        next(null, false);
      } else {
        app.locals.currentUser[foundUser.username] = foundUser;
        next(null, foundUser);
      }
    });
  });

  // app.use(express.session({ secret: 'anything' }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate())); // iseo: passport will use User's authenticate method which is passport-mongoose-local
  passport.use(jwtStrategy);

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  passport.use(new FacebookStrategy({
    clientID: '1011405085718313',
    clientSecret: '3b630313a8a2c8983405b55c11289e8b',
    callbackURL: '/LS_API/auth/facebook/callback'
  },
  ((accessToken, refreshToken, profile, done) => {
    console.log(`Facebook Login Completed. ID=${JSON.stringify(profile)}`);
    console.log(`Facebook Login Completed. accessToken=${accessToken}`);

    facebook.getFbData(accessToken, `/${profile.id}`, 'friends,email,name',
      (response) => {
        console.log(response);

        // Login completed... but how I could redirect the page??
        User.findOne({ email: response.email }, async (err, user) => {
          if (err || user == null) {
            console.log('user not found, create one with Facebook profile');
            user = await createUserByFacebookProfile(response, accessToken);
            app.locals.currentUser[user.username] = user;

            if (user) {
              console.log('user created successfully');
              done(null, user);
            } else {
              console.log('user creation failure');
              done(null, null);
            }

            // Is it needed?
            return;
          }
          console.log('Facebook login: saving current user');
          // ISEO-TBD: need work!!
          // app.locals.currentUser[req.user.username]
          console.log(`Facebook login: username = ${user.username}`);
          app.locals.currentUser[user.username] = user;
          // ISEO-TBD: What it is exactly?
          // what happens when done is called. who's getting user parameter?
          done(null, user);
        });
      });
  })));

  // iseo: It's kind of pre-processing or middleware for route handling
  app.use((req, res, next) => {
    if (req.user != undefined && req.user != null) {
      User.findById(req.user._id).populate('direct_friends', 'profile_picture email username name loggedInTime').exec((err, foundUser) => {
        if (err) {
          console.warn('User not found??');
        } else {
          app.locals.currentUser[foundUser.username] = foundUser;
        }
      });

      res.locals.error = req.flash('error');
      res.locals.success = req.flash('success');
      next();
    } else {
      // let's check if it's JWT based.
      if (req.headers.authorization !== undefined) {
        // API will be called even before JWT authentication is completed.
        passport.authenticate('jwt', { session: false })(req, res, (error) => {
          if (error) {
            console.warn('jwt auth failed');
          }
          next();
        });
      } else {
        next();
      }
    }
  });

  app.use('/LS_API', indexRoutes);
  app.use('/LS_API/listing', listingRoutes);
  app.use('/LS_API/mynetwork', mynetworkRoutes);
  app.use('/LS_API/listing/landlord', landlordRoutes);
  app.use('/LS_API/listing/tenant', tenantRoutes);
  app.use('/LS_API/listing/3rdparty', _3rdpartyRoutes);
  app.use('/LS_API/profile', profileRoutes);
  app.use('/LS_API/chatting', chattingRoutes);


  app.locals.profile_picture = '/public/user_resources/pictures/profile_pictures/default_profile.jpg';
  app.locals.lastReactMenu = '';
  app.locals.currentUser = [];

  app.locals.serverUrl = (process.env.NODE_ENV == 'development') ? 'http://localhost:5000' : process.env.EXPRESS_SERVER_URL;
  app.locals.fileServerUrl = (process.env.NODE_ENV == 'development') ? '/LS_API' : process.env.FILE_SERVER_URL;

  global.__basedir = __dirname; // ISEO-TBD: not sure if it's needed change

  console.log(`basedir=${__dirname}`);


  //= =============================================================================================
  // Define APIs
  //= =============================================================================================
  /*
  app.get('/getLoginStatus', (req, res) => {
    console.log('getLoginStatus called');
    if (req.user == undefined) res.json(null);
    else res.json(app.locals.currentUser[req.user.username]);
  });

  app.get('/getLastMenu', (req, res) => {
    console.log('getLastMenu called');
    res.json(app.locals.lastReactMenu);
    app.locals.lastReactMenu = '';
  }); */

  app.get('/drag_drop', (req, res) => {
    res.render('drag_drop_demo_v1');
  });

  // ISEO: req.files were undefined if it's used in routers.
  // We need to address this problem later, but I will define it inside app.js for now.
  app.post('/listing/landlord/:list_id/file_upload', (req, res) => {
    console.log(`file upload: listing_id: ${req.params.list_id}`);

    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
      }
      console.log(`Found listing. listing_id=${req.params.list_id}`);
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      const sampleFile = req.files.file_name;
      const picIndex = req.body.pic_index;
      const { list_id } = req.params;
      const picPath = `/public/user_resources/pictures/landlord/${list_id}_${picIndex}_${sampleFile.name}`;

      console.log(`picPath=${picPath}`);
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(serverPath + picPath, (err) => {
        if (err) return res.status(500).send(err);
        console.log('ISEO: Successful File upload');
        const picture = { path: picPath, caption: req.body.caption };
        // check if entry exists already
        if (picIndex > foundListing.pictures.length) {
          foundListing.pictures.push(picture);
        } else {
          foundListing.pictures[picIndex - 1] = picture;
        }
        foundListing.num_of_pictures_uploaded += 1;
        foundListing.save();
        fileUpload2Cloud(serverPath, picPath);
        res.send('File uploaded!');
      });
    });
  });

  app.post('/listing/landlord/:list_id/file_delete', (req, res) => {
    const picIndex = req.body.pic_index;
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      try {
        const picPath = `/public/user_resources/pictures/landlord/${req.params.list_id}_${picIndex}.jpg`;

        fileDeleteFromCloud(picPath);

        fs.unlinkSync(serverPath + picPath);
        foundListing.pictures[picIndex - 1].path = '';
        foundListing.num_of_pictures_uploaded -= 1;
        foundListing.save();
      } catch (err) {
        console.error(err);
      }
    });
  });

  // File operation for tenant
  // ISEO: req.files were undefined if it's used in routers.
  // We need to address this problem later, but I will define it inside app.js for now.
  app.post('/listing/tenant/:list_id/file_upload', (req, res) => {
    console.log(`file upload: listing_id: ${req.params.list_id}`);
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
      }
      console.log(`Found listing. listing_id=${req.params.list_id}`);
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      const sampleFile = req.files.file_name;
      const { list_id } = req.params;
      const picPath = `/public/user_resources/pictures/tenant/${list_id}_${sampleFile.name}`;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(serverPath + picPath, (err) => {
        if (err) {
          console.log(`mv operation failed with error code=${err}`);
          return res.status(500).send(err);
        }
        const picture = { path: picPath, caption: req.body.caption };
        // We will allow only 1 photo for now, and the same array entry will be used.
        if (foundListing.profile_pictures.length == 0) {
          foundListing.profile_pictures.push(picture);
        } else {
          foundListing.profile_pictures[0] = picture;
        }
        foundListing.num_of_profile_picture_uploaded += 1;
        foundListing.save();
        fileUpload2Cloud(serverPath, picPath);
        res.send('File uploaded!');
      });
    });
  });
  app.post('/listing/tenant/:list_id/file_delete', (req, res) => {
    console.log('tenant, file_delete is called');
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      try {
        console.log(`File path=${foundListing.profile_pictures[0].path}`);
        fileDeleteFromCloud(foundListing.profile_pictures[0].path);
        fs.unlinkSync(serverPath + foundListing.profile_pictures[0].path);

        foundListing.profile_pictures[0].path = '';
        foundListing.num_of_profile_picture_uploaded -= 1;
        foundListing.save();
        res.send('File Deleted!');
      } catch (err) {
        console.error(err);
      }
    });
  });

  // file operation for profile
  // ISEO: req.files were undefined if it's used in routers.
  // We need to address this problem later, but I will define it inside app.js for now.
  app.post('/profile/:user_id/file_upload', (req, res) => {
    console.log(`file upload: user_id: ${req.params.user_id}`);
    User.findById(req.params.user_id, (err, curr_user) => {
      if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
      }

      console.log('ISEO: uploading profile picture...');

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      const sampleFile = req.files.file_name;
      const { user_id } = req.params;
      const picPath = `/public/user_resources/pictures/profile_pictures/${user_id}_profile_${sampleFile.name}`;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(serverPath + picPath, (err) => {
        if (err) {
          console.log(`ISEO: upload failure. error=${err}`);
          return res.status(500).send(err);
        }

        if (curr_user.profile_picture) {
          fileDeleteFromCloud(curr_user.profile_picture);
        }

        curr_user.profile_picture = picPath;
        app.locals.profile_picture = picPath;
        curr_user.save();

        // ISEO-TBD:
        app.locals.currentUser[curr_user.username] = curr_user;
        fileUpload2Cloud(serverPath, picPath);

        res.send('File uploaded!');
      });
    });
  });
  app.post('/profile/:user_id/file_delete', (req, res) => {
    User.findById(req.params.user_id, (err, curr_user) => {
      try {
        fileDeleteFromCloud(curr_user.profile_picture);
        fs.unlinkSync(serverPath + curr_user.profile_picture);

        curr_user.profile_picture = '';
        curr_user.save();
      } catch (err) {
        console.error(err);
      }
    });
  });

  app.get('/public/user_resources/pictures/3rdparty/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/3rdparty/${fileName}`));
  });

  app.get('/public/user_resources/pictures/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/${fileName}`));
  });

  app.get('/public/user_resources/pictures/landlord/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/landlord/${fileName}`));
  });

  app.get('/public/user_resources/pictures/friends/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/friends/${fileName}`));
  });


  app.get('/public/user_resources/pictures/profile_pictures/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("Profile picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/profile_pictures/${fileName}`));
  });

  app.get('/public/user_resources/pictures/tenant/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/tenant/${fileName}`));
  });

  app.get('/scripts/:filename', (req, res) => {
    const fileName = req.params.filename;
    // console.log("script: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/scripts/${fileName}`));
  });

  let httpServer = null;

  if (process.env.NODE_ENV == 'development') {
    httpServer = app.listen(process.env.API_SERVER_PORT, () => {
      console.log(`LinkedSpacess API server listening on port ${process.env.API_SERVER_PORT}!`);
    });
  } else {
    httpServer = app.listen(process.env.API_SERVER_PORT || process.env.PORT || 8080, () => {
      console.log(`LinkedSpacess API server listening on port ${process.env.API_SERVER_PORT || process.env.PORT || 8080}!`);
    });
  }

  // starting chatting server
  chatServer.chatServerMain(httpServer);

  // Facebook login
  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //  /auth/facebook/callback
  app.get('/auth/facebook', passport.authenticate('facebook',
    {
      successRedirect: `${process.env.REACT_SERVER_URL}/facebooklogin/?user=inseo/`,
      failureRedirect: '/login'
    }), (req, res) => {
    console.log('This callback is not expected, auth/facebook/callback will be called instead');
  });

  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.post('/auth/facebook/relogin', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        console.log('User Not Found');
        res.json(null);
        return;
      }

      console.log(`relogin is called: user = ${JSON.stringify(user)}`);
      // req.body.username = 'inseo';
      req.body.password = user.password;

      console.log(`user password = ${user.password}`);

      downloadImage();

      // check if the user is logged in already
      if (app.locals.currentUser[req.body.username] != null) {
        passport.authenticate('local')(req, res, (error) => {
          if (error) {
            console.log('relogin failed');
            res.redirect(`${process.env.REACT_SERVER_URL}/login`);
          } else {
            req.flash('success', `Welcome back to LinkedSpaces ${req.body.username}`);
            console.log(`Welcome back to LinkedSpaces ${req.body.username}`);
            // res.redirect(`${process.env.REACT_SERVER_URL}`);
            res.json(user);
          }
        });
      } else {
        console.log('user is not logged in yet');
        res.json(null);
      }
    });
  });

  app.get('/refresh', (req, res) => {
    if (req.user != undefined && app.locals.currentUser[req.user.username] !== null) {
      User.findById(req.user._id).populate('direct_friends', 'profile_picture email username name loggedInTime').exec((err, foundUser) => {
        // ISEO-TBD: Need to make it sure that we populate things needed.
        // console.log(`foundUser = ${JSON.stringify(foundUser)}`);
        // app.locals.currentUser[req.user.username].direct_friends = foundUser.direct_friends;
        // console.log(`Before refresh: user = ${JSON.stringify(app.locals.currentUser[req.user.username])}`);
        if (err) {
          console.warn('User not found!!');
        } else {
          app.locals.currentUser[req.user.username] = foundUser;
          // console.log(`After refresh: user = ${JSON.stringify(app.locals.currentUser[req.user.username])}`);
          res.json(app.locals.currentUser[req.user.username]);
        }
      });
    } else {
      // this may happen when it's redirected to landing page after logout!!
      console.warn('req.user is undefined??');
      res.json(null);
    }
  });

  app.get('/auth/facebook/profile',
    (req, res) => {
      console.log(`profile called: user=${JSON.stringify(req.user)}`);
      res.redirect(`${process.env.REACT_SERVER_URL}/facebooklogin/${req.user.username}/login`);
    });

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook',
      {
        successRedirect: '/LS_API/auth/facebook/profile',
        // successRedirect: `${process.env.REACT_SERVER_URL}`,
        failureRedirect: '/login'
      }));


  // handle sign up logic
  app.post('/signup/local', (req, res) => {
    console.log(`signup: req.body = ${JSON.stringify(req.body)}`);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });


    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        console.log(`User.register failed = ${err.message}`);
        req.flash('error', err.message);
        return res.redirect('/');
      }
      // how to use facebook login?
      passport.authenticate('local')(req, res, () => {
        console.log(`User signed up successfully: user = ${user.username}`);
        user.loggedInTime = Date.now();
        user.save();
        req.flash('success', `Welcome to LinkedSpaces ${user.username}`);
        res.redirect('/');
      });
    });
  });


  app.get('/signup/facebook', passport.authenticate('facebook',
    {
      successRedirect: `${process.env.REACT_SERVER_URL}/facebooklogin/?user=inseo/`,
      failureRedirect: `${process.env.REACT_SERVER_URL}/signup`
    }), (req, res) => {
    console.log('This callback is not expected, auth/facebook/callback will be called instead');
  });
});

// app.get(['/app','/app/*'], (req,res) => {
//  console.log("ISEO: URL = " + req.originalUrl);
//  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
// });

// ISEO-TBD
/* app.get('/*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
}); */
