/* eslint-disable */
import React, { useContext, useEffect, useRef, useState } from 'react';
import shortid from 'shortid';
import '../../app.css';
import {FILE_SERVER_URL} from '../../globalConstants';
import './GeneralChatMainPage.css';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';

const maxPicturesToShow = 3;

function GroupContactSummary(props) {
  const { setCurrentChatPartyPicture, getProfilePictureByChattingType } = useContext(MessageContext);
  const { getProfilePicture, currentUser } = useContext(GlobalContext);
  const {clickState, contactIndex, user, summary} = props;
  const [currentClickState, setCurrentClickState] = useState(false);

  const contactRef = useRef(null);

  useEffect(() => {
    // this is called even though there is no value change
    if(contactRef.current)
    {
      if(currentClickState!=clickState)
      {
        contactRef.current.scrollIntoView({ block: 'end', inline: 'nearest'});
        setCurrentClickState(clickState);
      }
    }

  }, [clickState]);

  function handleClick(e) {
    e.preventDefault();
    props.clickHandler(contactIndex);
    setCurrentChatPartyPicture(user.profile_picture);
  }

  function getContactSummaryClassName() {
    let listOfClass = (clickState === 0 ? 'GroupContactSummary' : 'GroupContactSummaryClicked');

    if (contactIndex == 0) {
      setCurrentChatPartyPicture(user.profile_picture);
    }

    listOfClass = (summary.flag_new_msg) ? `${listOfClass} NewMessageIndicator` : listOfClass;
    return listOfClass;
  }

  function getListOfFriendPicture(maxPictures) {
    const listOfPictures = [];
    let numOfPictures = 0;
    const foundMyself = false;
    for (let i = 0; i < props.user.length && numOfPictures < maxPictures; i++) {
      // let's skip myself.
      if (user[i].username == currentUser.username) {
        continue;
      }

      const additional_style = {
        position: 'relative',
        width: '25%', // 25% percentage of what? Probably 25% percentage of parent width?
      };

      listOfPictures.push(
        <img key={shortid.generate()} 
         className="center rounded-circle" 
         style={additional_style} 
         src={FILE_SERVER_URL+getProfilePictureByChattingType(user[i].username)} 
         alt="myFriend" />
      );

      numOfPictures++;
    }

    return listOfPictures;
  }

  // let's show 3 pictures for now.
  const listOfPictures = getListOfFriendPicture(maxPicturesToShow);

  // the number of friends not shown in the picture
  // <note> we should exclude myself.
  const numOfExtraFriends = ((user.length - 1) > maxPicturesToShow) ? `+${user.length - maxPicturesToShow - 1}` : '';

  return (
    <div className={getContactSummaryClassName()} ref={contactRef} onClick={handleClick}>
      <div className="ProfilePicture">
        {listOfPictures}
        {numOfExtraFriends}
      </div>

      <div className="ChatTimeStamp">
        {props.summary.timestamp}
      </div>
      <div className="ChatSummary">
        {summary.msg_summary}
      </div>
    </div>
  );
}

export default GroupContactSummary;
