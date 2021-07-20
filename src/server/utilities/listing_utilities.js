const async = require('async');
const { addUserToList, removeUserFromList } = require('./array_utilities');
const chatServer = require('../chatting_server');

function sendDashboardAutoRefresh(currUserName, shared_user_group, type) {
    const userNameList = [];
    for (let index = 0; index < shared_user_group.length; index++) {
      if (currUserName !== shared_user_group[index].username) {
        userNameList.push(shared_user_group[index].username);
      }
    }
    chatServer.sendDashboardControlMessage(
      (type==='event') ? 
        chatServer.DASHBOARD_AUTO_REFRESH_EVENT:
        chatServer.DASHBOARD_AUTO_REFRESH, userNameList);
  }
  
  function sendDashboardControlMessage(currUserName, shared_user_group, controlCode) {
    const userNameList = [];
    for (let index = 0; index < shared_user_group.length; index++) {
      if (currUserName !== shared_user_group[index].username) {
        userNameList.push(shared_user_group[index].username);
      }
    }
    chatServer.sendDashboardControlMessage(controlCode, userNameList);
  }

  function handleLikeAction(req, res, foundListing) {
      if(!req.user) {
        console.warn(`Unexpected action while user is not logged in`);
        res.send('User is not logged in');
        return;
      }
      //console.warn(`handleLikeAction`);

      // find the index of child listing of which ID matches.
      let indexOfMatchingChildListing = -1;
      const childListingId = req.params.child_id;
      for (let index = 0; index < foundListing.child_listings.length; index++) {
        if (foundListing.child_listings[index].listing_id.equals(childListingId)) {
          indexOfMatchingChildListing = index;
          break;
        }
      }

      if (indexOfMatchingChildListing !== -1) {

        foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser = foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser.filter(_objId => _objId.equals(req.user._id) === false);

        if(foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser) {
            removeUserFromList(foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser, req.user._id);
        }

        addUserToList(foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser, req.user._id);

        //console.warn(`List of liked user = ${JSON.stringify(foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser)}`);
        foundListing.save();
        // console.warn('Successfully added');
        sendDashboardAutoRefresh(req.user.username, foundListing.shared_user_group, foundListing.listingType);

        res.send('Successfully added');
      } else {
        console.warn('No child listing found with given ID');
        res.send('No child listing found with given ID');
      }
  }

  function handleDislikeAction(req, res, foundListing) {
      // find the index of child listing of which ID matches.
      let indexOfMatchingChildListing = -1;
      const childListingId = req.params.child_id;
      for (let index = 0; index < foundListing.child_listings.length; index++) {
        if (foundListing.child_listings[index].listing_id.equals(childListingId)) {
          indexOfMatchingChildListing = index;
          break;
        }
      }

      if (indexOfMatchingChildListing !== -1) {
        if (foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser !== undefined) {
          foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser = foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser.filter(_objId => _objId.equals(req.user._id) === false);
        }
        addUserToList(foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser, req.user._id);

        //console.warn(`handleDislikeAction`);
        //console.warn(`List of liked user = ${JSON.stringify(foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser)}`);

        foundListing.save();
        // console.warn(`Successfully removed, length = ${foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser.length}`);
        sendDashboardAutoRefresh(req.user.username, foundListing.shared_user_group, foundListing.listingType);
        res.send('Successfully removed');
      } else {
        console.warn('No child listing found with given ID');
        res.send('No child listing found with given ID');
      }
  }


  function handleNeutralAction(req, res, foundListing) {
    // find the index of child listing of which ID matches.
    let indexOfMatchingChildListing = -1;
    const childListingId = req.params.child_id;
    for (let index = 0; index < foundListing.child_listings.length; index++) {
      if (foundListing.child_listings[index].listing_id.equals(childListingId)) {
        indexOfMatchingChildListing = index;
        break;
      }
    }

    if (indexOfMatchingChildListing !== -1) {

      foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser = foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser.filter(_objId => _objId.equals(req.user._id) === false);
      foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser = foundListing.child_listings[indexOfMatchingChildListing].listOfDislikedUser.filter(_objId => _objId.equals(req.user._id) === false);

      //console.warn(`handleNeutralAction`);

      foundListing.save();
      // console.warn(`Successfully removed, length = ${foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser.length}`);
      sendDashboardAutoRefresh(req.user.username, foundListing.shared_user_group, foundListing.listingType);
      res.send('Successfully removed');
    } else {
      console.warn('No child listing found with given ID');
      res.send('No child listing found with given ID');
    }
}

module.exports = {
    sendDashboardControlMessage,
    handleLikeAction,
    handleDislikeAction,
    handleNeutralAction
};
