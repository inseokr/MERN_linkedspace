/* eslint-disable */
import React, { useContext } from 'react';
import shortid from 'shortid';
import '../../app.css';
import {FILE_SERVER_URL} from '../../globalConstants';
import './GeneralChatMainPage.css';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';

// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';

const maxPicturesToShow = 3;

function GroupContactSummary(props) {
  const { setCurrentChatPartyPicture } = useContext(MessageContext);
  const { getProfilePicture, currentUser } = useContext(GlobalContext);

  function handleClick(e) {
    e.preventDefault();
    props.clickHandler(props.contactIndex);
    setCurrentChatPartyPicture(props.user.profile_picture);
  }

  function getContactSummaryClassName() {
    let listOfClass = (props.clickState === 0 ? 'GroupContactSummary' : 'GroupContactSummaryClicked');

    if (props.contactIndex == 0) {
      setCurrentChatPartyPicture(props.user.profile_picture);
    }

    listOfClass = (props.summary.flag_new_msg) ? `${listOfClass} NewMessageIndicator` : listOfClass;
    return listOfClass;
  }

  function getListOfFriendPicture(maxPictures) {
    const listOfPictures = [];
    let numOfPictures = 0;
    const foundMyself = false;
    for (let i = 0; i < props.user.length && numOfPictures < maxPictures; i++) {
      // let's skip myself.
      if (props.user[i].username == currentUser.username) {
        continue;
      }

      const additional_style = {
        position: 'relative',
        width: '25%', // 25% percentage of what? Probably 25% percentage of parent width?
      };

      listOfPictures.push(
        <img key={shortid.generate()} className="center rounded-circle" style={additional_style} src={FILE_SERVER_URL+getProfilePicture(props.user[i].username)} alt="myFriend" />
      );

      numOfPictures++;
    }

    return listOfPictures;
  }

  // let's show 3 pictures for now.
  const listOfPictures = getListOfFriendPicture(maxPicturesToShow);

  // the number of friends not shown in the picture
  // <note> we should exclude myself.
  const numOfExtraFriends = ((props.user.length - 1) > maxPicturesToShow) ? `+${props.user.length - maxPicturesToShow - 1}` : '';

  return (
    <div className={getContactSummaryClassName()} onClick={handleClick}>
      <div className="ProfilePicture">
        {listOfPictures}
        {numOfExtraFriends}
      </div>

      <div className="ChatTimeStamp">
        {props.summary.timestamp}
      </div>
      <div className="ChatSummary">
        {props.summary.msg_summary}
      </div>
    </div>
  );
}

export default GroupContactSummary;
