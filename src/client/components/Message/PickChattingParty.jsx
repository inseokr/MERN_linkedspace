import React, { Component, useContext } from 'react';
import '../../app.css';
import './MessageStyle.css';
import OnlineStatus from './OnlineStatus';
import {GlobalContext} from '../../contexts/GlobalContext';

function PickChattingParty(props) {

  let _group = props.group;

  const {friendsList, currentUser} = useContext(GlobalContext);

  let Header =
    <div className="boldHeader">
      <h4> New message </h4>
      <hr/>
    </div>;

  function getFriend(_friend) {
    return (
      <>
        <div className="friendWrapper" key={_friend.id}>
          <div>
            <img className="center rounded-circle imgCover" src={_friend.profile_picture} alt="myFriend" />
          </div>
          <div className="friendName">
            <h5> {_friend.username} </h5>
          </div>
          <div>
            <OnlineStatus marginLeft="auto"/>
          </div>
        </div>
        <hr/>
      </>
    )
  }

  function checkGroup(name) {
    _group.forEach(user => {
      if(user.user_name===name) {
        return true;
      }
    });
    return false;
  }

  function getListOfFriends() {
    // go through the list of direct friends
    let friends = friendsList.map((friend=> {
      // <note> need to skip friend in the shared_group
      if((name !== currentUser.username) && !checkGroup(friend.username)) {
        return getFriend(friend);
      }
    }));

    return friends;
  }

  return (
    <div className="container">
      {Header}
      {getListOfFriends()}
    </div>
  );
}
export default PickChattingParty;
