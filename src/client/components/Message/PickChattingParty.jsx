/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import shortid from 'shortid';
import '../../app.css';
import { FILE_SERVER_URL } from '../../globalConstants';
import './MessageStyle.css';
import OnlineStatus from './OnlineStatus';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function PickChattingParty(props) {
  try
  {
  const {_group, _listingId, modalShow} = props;

  // <note> friendsList doesn't include current user.
  const { friendsList, getProfilePicture, getUserLoginStatus } = useContext(GlobalContext);
  const { removeFromChatList, addToChatList } = useContext(MessageContext);
  //const [clickStates, setClickStates] = useState(new Array(friendsList.length).fill(0));
  const [clickStates, setClickStates] = useState([]);

  const Header = (
    <div className="boldHeader">
      {' '}
      <h4> Pick Chatting Party </h4>
      {' '}
      <hr />
      {' '}
    </div>
  );

  async function handleClickFriend(_friend, index) {
    // note:
    // update chatting context with selected friends
    // selected friend will be added to shared_user_group
    // <problem1> how to find a specific _3rd_party_listings?
    // child_listings._3rd_party_listings.push(_3rdparty_listing);
    // ==> It needs parent listing ID and the ID to find _3rd_party_listings
    // ==> I guess it's better to be handled inside MessageContext
    // ==> parent componet should update the current active listing information
    // ==> and current friend will be added through a callback or handler defined in
    // ==> MessageContext.
    // addContactList(_friend);
    const tempClickStates = [...clickStates];

    if (clickStates[index] == 1) {
      removeFromChatList(_friend);
      tempClickStates[index] = 0;
    } else {
      addToChatList(_friend);
      tempClickStates[index] = 1;
    }

    setClickStates(tempClickStates);
  }

  function getFriend(_friend, index) {
    const _style = (clickStates[index] == 1) ? 'friendWrapperClicked' : 'friendWrapper';
    let onlineStyle = {marginLeft: 'auto'};

    return (
      <div key={shortid.generate()}>
        <div className={_style} key={_friend.id} onClick={() => handleClickFriend(_friend, index)}>
          <div>
            <img className="center rounded-circle imgCover" src={FILE_SERVER_URL+getProfilePicture(_friend.username)} alt="myFriend" />
          </div>
          <div className="friendName">
            <h5>
              {_friend.username}
              {' '}
            </h5>
          </div>
          <div>
            <OnlineStatus additionalStyle={onlineStyle} loginStatus={getUserLoginStatus(_friend.username)}/>
          </div>
        </div>
        <hr />
      </div>
    );
  }

  function getListOfFriends() {
    // go through the list of direct friends
    return friendsList.map(((friend, index) => getFriend(friend, index)));
  }


  useEffect(() => {
    if(modalShow===false)
    {
      // clean-up click states
      let initClickStates = new Array(clickStates.length).fill(0);
      setClickStates(initClickStates);
    }
  }, [modalShow]);


  useEffect(()=> {
      if(friendsList!==undefined)
      {
        let initClickStates = new Array(friendsList.length).fill(0);
        setClickStates(initClickStates);
      }
  }, [friendsList]);

  return (
    <div className="container">
      {Header}
      {getListOfFriends()}
    </div>
  );
}
catch(error)
{
  console.log("error = " + error);
  return (<React.Fragment></React.Fragment>)
}

}

export default PickChattingParty;
