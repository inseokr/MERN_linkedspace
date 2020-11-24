/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import shortid from 'shortid';
import '../../app.css';
import './GeneralChatMainPage.css';

import ContactSummary from './ContactSummary';
import GroupContactSummary from './GroupContactSummary';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

function ChatContactList() {
  const { currentUser, friendsList } = useContext(GlobalContext);
  const { currentListing } = useContext(CurrentListingContext);
  const {
    switchChattingChannel,
    currChannelInfo,
    dmChannelContexts,
    setCurrChannelInfo,
    childIndex,
    loadChattingDatabase,
    chattingContextType,
    getDmChannelId
  } = useContext(MessageContext);

  function removeCurrentUserFromList(_list) {
    if (_list == null) return null;

    return _list.filter(_item => _item.username !== currentUser.username);
  }

  function _getContactList() {
    // non-listing associated chatting window
    if (chattingContextType == 0) {
      return ((friendsList == undefined) ? null : friendsList);
    }
    // listing associated chatting window

    if (chattingContextType == 1) {
      return currentListing.shared_user_group;
    }

    return ((currentListing.child_listings[childIndex] == undefined)
      ? null : currentListing.child_listings[childIndex].shared_user_group);
  }

  function buildContactStates() {
    // console.log.log("buildContactStates");

    const _contactStates = [];
    let _currentActiveIndex = 0;
    let _numOfDmChannels = 0;
    const adjustedFriendsList = removeCurrentUserFromList(_getContactList());
    let bFoundDefaultContact = false;

    // console.log.log("adjustedFriendsList: length = " + adjustedFriendsList.length);

    try {
      // 1. process DM
      for (let i = 0; i < adjustedFriendsList.length; i++) {
        const _contactState = {
          active: 0,
          type: 'dm',
          userList: adjustedFriendsList[i],
          channelInfo:
          {
            channelName: getDmChannelId(adjustedFriendsList[i].username),
            members: []
          }
        };

        _contactState.channelInfo.members.push(adjustedFriendsList[i].username);

        if (currChannelInfo.channelName == _contactState.channelInfo.channelName) {
          _contactState.active = 1;
          bFoundDefaultContact = true;
          _currentActiveIndex = i;
          // switchChattingChannel(_contactState.channelInfo, true);
        }

        _contactStates.push(_contactState);
      }

      _numOfDmChannels = _contactStates.length;

      // 2. processs group chatting channel
      // <note> group chatting's supported only in the posting. not in general chatting.
      if (chattingContextType >= 1) {
        const list_of_group_chats = (chattingContextType == 1)
          ? currentListing.list_of_group_chats
          : (currentListing.child_listings[childIndex] != undefined)
            ? currentListing.child_listings[childIndex].list_of_group_chats
            : [];

        // console.log.log("list_of_group_chats.length =  " + list_of_group_chats.length);
        for (let i = 0; i < list_of_group_chats.length; i++) {
          const _contactState = {
            active: 0,
            type: 'group',
            userList: list_of_group_chats[i].friend_list,
            channelInfo:
            {
              channelName: list_of_group_chats[i].channel_id
            }
          };

          const _members = [];
          let bPartOfGroupChat = false;

          for (let j = 0; j < list_of_group_chats[i].friend_list.length; j++) {
            if (list_of_group_chats[i].friend_list[j].username == currentUser.username) {
              bPartOfGroupChat = true;
            }
            _members.push(list_of_group_chats[i].friend_list[j].username);
          }

          if (bPartOfGroupChat == true) {
            _contactState.channelInfo.members = [..._members];

            if (currChannelInfo.channelName == _contactState.channelInfo.channelName) {
              _contactState.active = 1;
              bFoundDefaultContact = true;
              _currentActiveIndex = i + _numOfDmChannels;
            }

            _contactStates.push(_contactState);
          }
        }
      }

      if (bFoundDefaultContact == false) {
        // let's make the last item active if there is no previous active channel
        loadChattingDatabase();
      }

      // check if any new chattig channel added
      // we will active the newly added chatting channel if so.
      if (contactStates != undefined && _contactStates.length != contactStates.length) {
        // console.log.log(" New Member added!!!");
        _contactStates[_currentActiveIndex].active = 0;
      }
    } catch (err) {
      console.warn(`buildContactStates: error = ${err}`);
    }

    return _contactStates;
  }

  // array of the following structure
  // {active: [1|0], type: [dm|group], channelName, userList, channelInfo}
  const [contactStates, setContactStates] = useState(buildContactStates());

  async function handleClickState(index) {
    try {
      // update contactStates where the index is referring to
      const _newContactStates = [...contactStates];

      // update click state(active)
      for (let i = 0; i < contactStates.length; i++) {
        _newContactStates[i].active = 0;
      }
      _newContactStates[index].active = 1;

      setContactStates(_newContactStates);

      // We need to make it sure that loadChattingDatabase should be called in sequence.
      // second parameter tells if loadChattingDatabase is needed
      switchChattingChannel(_newContactStates[index].channelInfo, true);
      // loadChattingDatabase();
    } catch (err) {
      console.warn(`handleClickState: error = ${err}`);
    }
  }

  useEffect(() => {
    // check if there is no active channel
    let bFoundDefaultContact = false;

    for (let i = 0; i < contactStates.length; i++) {
      if (contactStates[i].active == 1) {
        bFoundDefaultContact = true;
      }
    }

    if (bFoundDefaultContact == false) {
      // let's click the last item.
      handleClickState(contactStates.length - 1);
    }

    // <note> this will ensure the clean up of chatting history.
    // You may see previous chatting history without it.
    if(contactStates.length===0)
    {
      setCurrChannelInfo({channelName: null, members: null});
    }
  }, [contactStates]);

  useEffect(() => {
    // need to re-build the states if chattingContextType is changed.
    setContactStates(buildContactStates());
  }, [chattingContextType, currentListing, friendsList]);

  function buildContactList() {
    const contacts = [];
    for (let i = 0; i < contactStates.length; i++) {
      const _context = dmChannelContexts[contactStates[i].channelInfo.channelName];
      const channelSummary = {
        flag_new_msg: _context != undefined ? _context.flag_new_msg : false,
        timestamp: _context != undefined ? _context.datestamp : null,
        msg_summary: _context != undefined ? _context.msg_summary : ''
      };

      // DM case
      if (contactStates[i].type == 'dm') {
        contacts.push(
          <div key={shortid.generate()}>
            <ContactSummary
              contactIndex={i}
              clickState={contactStates[i].active}
              clickHandler={handleClickState}
              user={contactStates[i].userList}
              summary={channelSummary}
            />
          </div>
        );
      }
      // Group Chatting case
      else {
        contacts.push(
          <div key={shortid.generate()}>
            <GroupContactSummary
              contactIndex={i}
              clickState={contactStates[i].active}
              clickHandler={handleClickState}
              user={contactStates[i].userList}
              summary={channelSummary}
            />
          </div>
        );
      }
    }

    return contacts;
  }

  return (
    <React.Fragment>
      {buildContactList()}
    </React.Fragment>
  );
}

export default ChatContactList;
