const express = require('express');
const User = require('../../models/user');

const router = express.Router();

const node = require('deasync');

node.loop = node.runLoopOnce;

module.exports = function (app) {
  async function getCurUser(req) {
    return new Promise((resolve, reject) => {
      User.findById(req.user._id, (err, curr_user) => {
        if (err) {
          console.log(`err = ${err}`);
          reject("user doesn't exist");
        } else {
          resolve(curr_user);
        }
      });
    });
  }

  function getSummaryOfUser(user_id) {
    return new Promise((resolve) => {
      User.findById(user_id, (err, curr_user) => {
        const friend = 				{
				  profile_picture: curr_user.profile_picture,
				  name: `${curr_user.firstname} ${curr_user.lastname}`,
				  address: { city: curr_user.address.city, state: curr_user.address.state },
				  username: curr_user.username,
				  id: user_id
        };

        resolve(friend);
      });
    });
  }

  function pushFriendReqstList(list, friend) {
    return new Promise((resolve) => {
      list.push(friend);
      resolve(list);
    });
  }

  function requestedAlready(curr_user, friend_id) {
    for (let index = 0; index < curr_user.outgoing_friends_requests.length; index++) {
      if (curr_user.outgoing_friends_requests[index].equals(friend_id) == true) {
        return true;
      }
    }

    return false;
  }

  function checkIncomingRequests(curr_user, friend_id) {
    for (let index = 0; index < curr_user.incoming_friends_requests.length; index++) {
      if (curr_user.incoming_friends_requests[index].equals(friend_id) == true) {
        return true;
      }
    }

    return false;
  }

  function isDirectFriend(curr_user, friend_id) {
    let bFound = false;

    curr_user.direct_friends.forEach((friend) => {
      if (friend.equals(friend_id) == true) {
        bFound = true;
        // ISEO: seriously??? function return twice??
        // I returned true from here,
        // but it didn't break out from the function and it moved on to return outside of this for loop.
      }
    });

    return bFound;
  }


  // establish the friendship between friend_1 & friend_2
  function establishFriendship(res, friend_id_1, friend_id_2) {
    User.findById(friend_id_1, (err, friend_1) => {
      if (err) {
        console.log('No such user found');
      } else {
        User.findById(friend_id_2, (err, friend_2) => {
          if (isDirectFriend(friend_2, friend_id_1) === true) {
            console.log("we're friend already");
            res.redirect('/MyNetworks');
            return;
          }

          friend_1.direct_friends.push(friend_id_2);

          // remove both incoming&outgoing entries if any
          // This works but non-sense to me... why should I query again??
          User.update({
            _id: friend_id_1
          }, {
            $pull:
                  { incoming_friends_requests: friend_id_2 }
          },
          (err, val) => {
            User.update({
              _id: friend_id_1
            }, {
              $pull:
                    { outgoing_friends_requests: friend_id_2 }
            },
            (err, val) => {
              friend_1.save();
            });
          });

          // remove both incoming&outgoing entries if any
          // This works but non-sense to me... why should I query again??
          friend_2.direct_friends.push(friend_id_1);

          // remove both incoming&outgoing entries if any
          // This works but non-sense to me... why should I query again??
          User.update({
            _id: friend_id_2
          }, {
            $pull:
                  { incoming_friends_requests: friend_id_1 }
          },
          (err, val) => {
            // Let's render with updated database...
            // remove both incoming&outgoing entries if any
            // This works but non-sense to me... why should I query again??
            User.update({
              _id: friend_id_2
            }, {
              $pull:
                    { outgoing_friends_requests: friend_id_1 }
            },
            (err, val) => {
              friend_2.save();
              // Let's render with updated database...
              res.redirect('/MyNetworks');
            });
          });
        });
      }
    });
  }

  async function buildRecommendedFriendsList(curr_user) {
    return new Promise((resolve) => {
      User.find({}, (error, users) => {
        const recommended_friends_list = [];

        users.forEach((user) => {
          if ((curr_user._id.equals(user._id) != true)
					   && (requestedAlready(curr_user, user._id) == false)
					   && (checkIncomingRequests(curr_user, user._id) == false)
					   && (isDirectFriend(curr_user, user._id) == false)) {
            const friend = {
              profile_picture: user.profile_picture,
              name: `${user.firstname} ${user.lastname}`,
              address: { city: user.address.city, state: user.address.state },
              id: user._id
            };

            // let's use username instead if name is empty
            if (friend.name == ' ') {
              friend.name = user.username;
            }

            recommended_friends_list.push(friend);
          }
        });

        resolve(recommended_friends_list);
      });
    });
  }

  function buildFriendsList(input_list) {
    return new Promise(async (resolve) => {
      const output_list = [];

      if (input_list.length == 0) {
        resolve(output_list);
      }

      for (let friend_idx = 0; friend_idx < input_list.length; friend_idx++) {
        const friend = await getSummaryOfUser(input_list[friend_idx]);
        const res = await pushFriendReqstList(output_list, friend);

        if ((friend_idx + 1) == input_list.length) {
          resolve(output_list);
        }
      }
    });
  }

  function buildAsyncFriendList(input_list) {
    return new Promise(async (resolve) => {
      buildFriendsList(input_list).then((output_list) => { resolve(output_list); });
    });
  }


  async function buildMyNetworkList(req) {
	     return new Promise(async (resolve) => {
      const networkInfo = {};

      const curUser = await getCurUser(req);

      networkInfo.recommended_friends_list = await buildRecommendedFriendsList(curUser);
      networkInfo.pending_friends_request_list = await buildAsyncFriendList(curUser.outgoing_friends_requests);
      networkInfo.direct_friends_list = await buildAsyncFriendList(curUser.direct_friends);

      buildAsyncFriendList(curUser.incoming_friends_requests).then((req_list) => {
        networkInfo.number_of_friends = curUser.direct_friends.length;
        networkInfo.incoming_friends_request_list = req_list;
        resolve(networkInfo);
      });
    });
  }

  /* router.get("/", function(req, res){

		buildMyNetworkList(req).then((networkInfo) => {

			res.render("mynetwork/mynetwork_main", {network_info: networkInfo});

		});
	}); */

  router.get('/networkinfo', (req, res) => {
    buildMyNetworkList(req).then((networkInfo) => {
      res.json(networkInfo);
    });
  });


  router.get('/friend_list', (req, res) => {
    // console.log("Get friend list");
    // ISEO-TBD: NOOOOO... please don't rely on app.locals??
    if (req.user.username == undefined) {
      res.json(null);
    } else {
      // <note> we have to make it sure that direct_friends is already populated.
      res.json(app.locals.currentUser[req.user.username].direct_friends);
    }
  });


  router.post('/:friend_id/friend_request', (req, res) => {
    User.findById(req.params.friend_id, (err, user) => {
      if (err) {
        console.log('No such user found');
      } else {
        // <note> req.user: isn't it User object already?
        User.findById(req.user._id, (err, curr_user) => {
          // ISEO: I don't know why name is not saved to the database...
          user.incoming_friends_requests.push(req.user._id);
          user.save();

          curr_user.outgoing_friends_requests.push(user._id);
          curr_user.save();
          // Let's render with updated database...
          res.redirect('/MyNetworks');
        });
      }
    });
  });

  router.post('/:friend_id/friend_accept', (req, res) => {
    console.log('ISEO:friend_accept');

    if (req.user === undefined) {
      console.warning('friend_accept: req.user is undefined!!!');
      res.redirect('/MyNetworks');
    } else {
      establishFriendship(res, req.user._id, req.params.friend_id);
    }
  });

  router.get('/:filename', (req, res) => {
    const fileName = req.params.filename;
	 	console.log(`received file name=${fileName}`);
	  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
  });

  return router;
};
