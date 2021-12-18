const express = require('express');

const router = express.Router();
const passport = require('passport');
const node = require('deasync');
const User = require('../../models/user');

node.loop = node.runLoopOnce;

router.get('/', (req, res) => {
  // 1. get user information from DB
  User.findById(req.user._id, (err, curr_user) => {
    const userInfo = {
      user_id: req.user._id,
      profile_picture: curr_user.profile_picture,
      firstname: curr_user.firstname,
      lastname: curr_user.lastname,
      username: curr_user.username,
      name: curr_user.name,
      email: curr_user.email,
      phone: curr_user.phone,
      password: curr_user.password,
      birthdate: curr_user.birthdate,
      address: curr_user.address,
      gender: curr_user.gender

    };

    res.render('./profile/profile_main', { user_info: userInfo });
  });
});

router.put('/:user_id', (req, res) => {
  User.findById(req.params.user_id, (err, curr_user) => {
    curr_user.firstname = req.body.first_name;
    curr_user.lastname = req.body.last_name;
    curr_user.name = `${req.body.first_name} ${req.body.last_name}`;
    curr_user.username = req.body.user_name;
    curr_user.phone = req.body.phone;
    curr_user.email = req.body.email;
    curr_user.address = req.body.location;

    // Why should I use Date structure??
    const birthdayString = `${req.body.birthdate.year}-${req.body.birthdate.month}-${req.body.birthdate.date}`;
    curr_user.birthdate = new Date(birthdayString);

    curr_user.gender = req.body.gender;


    res.redirect('/');
  });
});


router.put('/:user_id/phone', (req, res) => {
  User.findById(req.params.user_id, (err, curr_user) => {
    let {phone} = req.body;
    curr_user.phone = phone;
    curr_user.save((err)=>{
      if(err) {
        res.json({result: 'FAIL', err: err});
        return;
      }
      res.json({result: 'OK'});
    });
  });
});

router.put('/:user_id/email', (req, res) => {
  console.warn(`Updating email....`);
  User.findById(req.params.user_id, (err, curr_user) => {
    let {email} = req.body;

    console.warn(`new email: ${email}`);
    curr_user.email = email;
    curr_user.save((err)=>{
      if(err) {
        res.json({result: 'FAIL', err: err});
        return;
      }
      res.json({result: 'OK'});
    });
  });
});

router.get('/:filename', (req, res) => {
  const fileName = req.params.filename;
 	console.log(`received file name=${fileName}`);
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;
