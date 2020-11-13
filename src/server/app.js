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
const User = require('./models/user');
require('express-namespace');

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

  const url = process.env.DATABASEURL || 'mongodb://localhost/Linkedspaces';
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
    secret: 'Once again Rusty wins cutest dog!',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate())); // iseo: passport will use User's authenticate method which is passport-mongoose-local
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  passport.use(new FacebookStrategy({
    clientID: '1011405085718313',
    clientSecret: '3b630313a8a2c8983405b55c11289e8b',
    callbackURL: 'http://localhost:5000/auth/facebook/callback'
  },
  ((accessToken, refreshToken, profile, done) => {
    console.log(`Facebook Login Completed. ID=${profile.id}`);

    facebook.getFbData(accessToken, `/${profile.id}`, 'friends,email,name',
      (response) => {
        console.log(response);
      });

    // Login completed... but how I could redirect the page??
    User.findOne({ username: 'inseo' }, (err, user) => {
      if (err) { return done(err); }
      console.log('Facebook login: saving current user');
      // ISEO-TBD: need work!!
      app.locals.currentUser.inseo = user;
      done(null, user);
    });
  })));

  // iseo: It's kind of pre-processing or middleware for route handling
  app.use((req, res, next) => {
    if (req.user != undefined) {
      res.locals.currentUser = req.user;
      app.locals.currentUser[req.user.username] = req.user;
    }
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
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

  app.locals.serverUrl = (process.env.NODE_ENV == 'development') ? 'http://localhost:3000' : process.env.EXPRESS_SERVER_URL;

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

  // /////////////////////////////////////////////////////////////////////////////////
  // All the file upload will be defined in below
  // <note> File upload feature is not working well inside router.
  // /////////////////////////////////////////////////////////////////////////////////
  /* app.post('/listing/3rdparty/file_upload', function(req, res) {

  let sampleFile = req.files.file_name;
  let picPath = "/public/user_resources/pictures/3rdparty/"+sampleFile.name;

  console.log("file_upload: picPath=" + picPath);
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(serverPath+picPath, function(err) {
      if (err)
        return res.status(500).send(err);
      console.log("ISEO: Successful File upload");

      res.send('File uploaded!');
  });

}); */

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
        res.send('File uploaded!');
      });
    });
  });

  app.post('/listing/landlord/:list_id/file_delete', (req, res) => {
    console.log(`ISEO: file_delete called with pic_index=${req.body.pic_index}`);
    const picIndex = req.body.pic_index;
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      try {
        const picPath = `/public/user_resources/pictures/landdlord/${req.params.list_id}_${picIndex}.jpg`;

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

      console.log(`picPath=${picPath}`);
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(serverPath + picPath, (err) => {
        if (err) {
          console.log(`mv operation failed with error code=${err}`);
          return res.status(500).send(err);
        }
        console.log('ISEO: Successful File upload');
        const picture = { path: picPath, caption: req.body.caption };
        // We will allow only 1 photo for now, and the same array entry will be used.
        if (foundListing.profile_pictures.length == 0) {
          foundListing.profile_pictures.push(picture);
        } else {
          foundListing.profile_pictures[0] = picture;
        }
        foundListing.num_of_profile_picture_uploaded += 1;
        foundListing.save();
        res.send('File uploaded!');
      });
    });
  });
  app.post('/listing/tenant/:list_id/file_delete', (req, res) => {
    console.log('tenant, file_delete is called');
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      try {
        console.log(`File path=${foundListing.profile_pictures[0].path}`);
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
      // ISEO-TBD: Wow... what is it?
      const picPath = `/public/user_resources/pictures/${user_id}_` + 'profile' + `.${sampleFile.name.split('.')[1]}`;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(serverPath + picPath, (err) => {
        if (err) {
          console.log(`ISEO: upload failure. error=${err}`);
          return res.status(500).send(err);
        }

        console.log('ISEO: Successful File upload');
        curr_user.profile_picture = picPath;
        app.locals.profile_picture = picPath;
        curr_user.save();
        res.send('File uploaded!');
      });
    });
  });
  app.post('/profile/:user_id/file_delete', (req, res) => {
    User.findById(req.params.user_id, (err, curr_user) => {
      try {
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
    httpServer = app.listen(3000, () => {
      console.log('LinkedSpacess API server listening on port 3000!');
    });
  } else {
    httpServer = app.listen(process.env.PORT || 8080, () => {
      console.log(`LinkedSpacess API server listening on port ${process.env.PORT || 8080}!`);
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
      successRedirect: '/listing',
      failureRedirect: '/login'
    }), (req, res) => {
    console.log('This callback is not expected, auth/facebook/callback will be called instead');
  });
  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/listing',
      failureRedirect: '/login'
    }));
});

// app.get(['/app','/app/*'], (req,res) => {
//  console.log("ISEO: URL = " + req.originalUrl);
//  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
// });

// ISEO-TBD
/* app.get('/*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
}); */
