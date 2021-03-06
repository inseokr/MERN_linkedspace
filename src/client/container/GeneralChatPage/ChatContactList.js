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
  const { currentListing,  currentChildIndex} = useContext(CurrentListingContext);
  const {
    switchChattingChannel,
    currChannelInfo,
    dmChannelContexts,
    setCurrChannelInfo,
    childIndex,
    loadChattingDatabase,
    loadChattingDatabase4SelectedChannel,
    chattingContextType,
    getDmChannelId,
    msgCounter,
    checkIfAnyChatHistory,
    channelContextLength,
    selectedChatList,
    resetChatList,
    getSelectedChannelId,
    newContactSelected, 
    setNewContactSelected,
    flagNewlyLoaded,
    setFlagNewlyLoaded,
    checkIfAnyNewMsgArrived,
    checkIfAnyNewMsgArrivedListingChannel
  } = useContext(MessageContext);

  function removeCurrentUserFromList(_list) {
    if (_list == null || currentUser == null) return null;

    return _list.filter(_item => _item.username !== currentUser.username);
  }

  function _getContactList() {
    try {
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
    } catch(err) {
      console.warn(err);
      return null;
    }
  }

  function checkIfAnyNewMessage(channelName)
  {
        const _context = dmChannelContexts[channelName];
        return ((_context != undefined) ? _context.flag_new_msg : false);
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

        if ((bFoundDefaultContact === false) && 
            (currChannelInfo.channelName === _contactState.channelInfo.channelName)) {
              //console.warn(`${currChannelInfo.channelName} set to active as it's the current active chatting channel`)
              _contactState.active = 1;
              bFoundDefaultContact = true;
              _currentActiveIndex = i;
        }
        else
        {
          //console.warn(`newMsgArrivedListingChannel=${checkIfAnyNewMsgArrivedListingChannel()}, new msg? = ${checkIfAnyNewMessage(_contactState.channelInfo.channelName)}`);
          if (checkIfAnyNewMessage(_contactState.channelInfo.channelName) && 
              (checkIfAnyNewMsgArrived()===true || checkIfAnyNewMsgArrivedListingChannel()===true) )
          {
            //console.warn(`new message`);
            _contactState.active = 1;

            if(bFoundDefaultContact === true && (_currentActiveIndex < _contactStates.length))
            {
              _contactStates[_currentActiveIndex].active = 0;
            }

            bFoundDefaultContact = true;
            _currentActiveIndex = i;
          }
          else
          {
            _contactState.active = 0;
          }
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

            if ((bFoundDefaultContact === false) && 
                (currChannelInfo.channelName === _contactState.channelInfo.channelName)) {
              _contactState.active = 1;
              bFoundDefaultContact = true;
              _currentActiveIndex = i + _numOfDmChannels;
            }
            else
            {
              if (checkIfAnyNewMessage(_contactState.channelInfo.channelName) &&
                  (checkIfAnyNewMsgArrived()===true || checkIfAnyNewMsgArrivedListingChannel()===true))
              {
                _contactState.active = 1;

                if(bFoundDefaultContact === true && (_currentActiveIndex < _contactStates.length))
                {
                  _contactStates[_currentActiveIndex].active = 0;
                }

                bFoundDefaultContact = true;
                _currentActiveIndex = i + _numOfDmChannels;
              }
              else
              {
                _contactState.active = 0;
              }
            }
            _contactStates.push(_contactState);
          }
        }
      }

      // check if any new chattig channel added
      // we will active the newly added chatting channel if so.
      if (contactStates != undefined && _contactStates.length != contactStates.length) {
        // console.log.log(" New Member added!!!");
        _contactStates[_currentActiveIndex].active = 0;
      }

      if(bFoundDefaultContact === true)
      {
        if(contactStates!==undefined)
        {
          switchChattingChannel(_contactStates[_currentActiveIndex].channelInfo, true);
        }
      }
    } catch (err) {
      // Error may happen because contactStates is being access even before it's created.
      //console.warn(`buildContactStates: error = ${err}`);
    }
    return _contactStates;
  }

  // array of the following structure
  // {active: [1|0], type: [dm|group], channelName, userList, channelInfo}
  // <note> buildContactStates won't be called even if GeneralChatMainpage is being rendered?
  // It's called, but not used to update contactStates
  const [contactStates, setContactStates] = useState(buildContactStates());
  let channelId2IndexMap = [];

  function handleDelayedPickChatParty() {
    if(newContactSelected===true)
    {
      // MessageContext will get the channel ID from the selectedChatList
      let channelId = getSelectedChannelId();
      // get the index by channelId
      let index = channelId2IndexMap[channelId];

      if(index===undefined)
      {
        //console.warn(`handleDelayedPickChatParty: loading chatting DB`);
        // ISEO-TBD: how can we load the specific channel?
        loadChattingDatabase4SelectedChannel();
        return false;
      }
      else
      {
        //console.warn(`handleDelayedPickChatParty: delayed click`);
        handleClickState(index);
        setNewContactSelected(false);
        resetChatList();
        return true;
      }
    }

    return false;
  }

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
      // <note> does it have the proper channInformation?
      //console.warn(`handleClickState = ${JSON.stringify(_newContactStates[index].channelInfo)}`);
      switchChattingChannel(_newContactStates[index].channelInfo, true);
    } catch (err) {
      console.warn(`handleClickState: error = ${err}`);
    }
  }

  useEffect(() => {
    //console.warn(`newContactSelected`);
    if(newContactSelected===true)
    {
      // MessageContext will get the channel ID from the selectedChatList
      let channelId = getSelectedChannelId();

      // get the index by channelId
      let index = channelId2IndexMap[channelId];

      if(index===undefined) 
      {
        //console.warn(`loadChattingDatabase: newContactSelected`);
        //ISEO-TBD: do we really need to load everything here?
        loadChattingDatabase4SelectedChannel();
      }
      else
      {
        handleClickState(index);
        setNewContactSelected(false);
        resetChatList();
      }
    }
  }, [newContactSelected]);

  useEffect(() => {
    //console.warn(`contactStates updated`);
    // check if there is no active channel
    let bFoundDefaultContact = false;
    let indexOfChatpartyWithHistory = -1;
    let indexOfActiveChannel = -1;

    for (let i = 0; i < contactStates.length; i++) {
      if (contactStates[i].active == 1) {
        bFoundDefaultContact = true;
        indexOfActiveChannel = i;
      }

      //console.warn(`contactStates=${JSON.stringify(contactStates[0])}`);
      //console.warn(`checkIfAnyChatHistory=${checkIfAnyChatHistory(contactStates[0].channelInfo.channelName)}`);

      if((indexOfChatpartyWithHistory===-1) && 
         (contactStates[i].channelInfo !==undefined) && 
         (checkIfAnyChatHistory(contactStates[i].channelInfo.channelName) === true))
      {
        //console.warn(`found contact with history`);
        indexOfChatpartyWithHistory = i;
        indexOfActiveChannel = i;
      }
    }

    if (bFoundDefaultContact == false || newContactSelected===true ) {
      if(contactStates.length>0)
      {
        if(dmChannelContexts[contactStates[0].channelInfo.channelName]===undefined)
        {
          // need loading of database
          //console.warn(`Noooo... still no context created yet`);
          // ISEO-TBD: do we need to load all database?
          loadChattingDatabase(contactStates[0].channelInfo);
          indexOfActiveChannel = -1;
        }
        else
        {
          if(indexOfChatpartyWithHistory!==-1 && newContactSelected===false)
          {
            //console.warn(`handleClickState`);
            handleClickState(indexOfChatpartyWithHistory);
            indexOfActiveChannel = indexOfChatpartyWithHistory;
          }
          else {
            let bChatPartyAvailable = handleDelayedPickChatParty();
            //console.warn(`handleDelayedPickChatParty: bChatPartyAvailable=${bChatPartyAvailable}`);
            if( bChatPartyAvailable === false) indexOfActiveChannel = -1;
          }
        }
      }

      if(indexOfActiveChannel===-1)
      {
        // let's prevent infinite rendering
        if(currChannelInfo.channelName!==null)
        {
          setCurrChannelInfo({channelName: null, members: null});
        }
      }
    }

    // <note> this will ensure the clean up of chatting history.
    // You may see previous chatting history without it.
    if(contactStates.length===0)
    {
      if(currChannelInfo.channelName!==null)
      {
        setCurrChannelInfo({channelName: null, members: null});
      }
    }
  }, [contactStates]);

  useEffect(() => {
    //console.warn(`buildContactStates: chattingContextType/currentListing`);
    // need to re-build the states if chattingContextType is changed.
    let _contactStates = buildContactStates();
    setContactStates(_contactStates);
    
  }, [chattingContextType, currentListing]);


  useEffect(()=> {
    //console.warn(`buildContactStates: friendsList`);
    // rebuild states as new friends got added
    let _contactStates = buildContactStates();
    setContactStates(_contactStates);
  }, [friendsList]);

  useEffect(() => {
    //console.warn(`buildContactStates: childIndex/currentChildIndex`);
    // need to re-build the states if chattingContextType is changed.
    let _contactStates = buildContactStates();
    setContactStates(_contactStates);

  }, [childIndex, currentChildIndex]);


  useEffect(() => {
    //console.warn(`buildContactStates: dmChannelContexts/msgCounter`);
    let _contactStates = buildContactStates();
    if(_contactStates.length!==0) {
        setContactStates(_contactStates);
    }
  }, [dmChannelContexts, msgCounter]);

  useEffect(() => {
    //console.warn(`chattingContextType changed`);
    loadChattingDatabase();
  }, [chattingContextType]);

  useEffect(()=> {
    //console.warn(`buildContactStates: channelContextLength`);
    let _contactStates = buildContactStates();
    if(_contactStates.length!==0) {
      setContactStates(_contactStates);
    }
  }, [channelContextLength])

  function checkAnyActiveChannel() {
    if(contactStates!==undefined && contactStates.length > 0) {
      for(let index=0; index < contactStates.length; index++) {
        if(contactStates[index].active===1) return true;
      }
    }
    return false;
  }

  useEffect(()=> {
    //console.warn(`flagNewlyLoaded`);
    if(flagNewlyLoaded===true)
    {
      if(checkAnyActiveChannel()===false)
      {
        let _contactStates = buildContactStates();
        if(_contactStates.length!==0) {
            setContactStates(_contactStates);
        }
      }
      setFlagNewlyLoaded(false);
    }
  }, [flagNewlyLoaded]);

  function buildContactList() {
    const contacts = [];

    for (let i = 0; i < contactStates.length; i++) {

      channelId2IndexMap[contactStates[i].channelInfo.channelName] = i;

      const _context = dmChannelContexts[contactStates[i].channelInfo.channelName];
      const channelSummary = {
        flag_new_msg: _context != undefined ? _context.flag_new_msg : false,
        timestamp: _context != undefined ? _context.datestamp : null,
        msg_summary: _context != undefined ? _context.msg_summary : ''
      };

      // hide it if there is no chatting history and not active
      let additionalStyle = 
        (checkIfAnyChatHistory(contactStates[i].channelInfo.channelName)===false)
          && (contactStates[i].active === 0)
          ? {display: 'none'}: {};
      
      // DM case
      if (contactStates[i].type == 'dm') {
        contacts.push(
          <div key={shortid.generate()} style={additionalStyle}>
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
          <div key={shortid.generate()} style={additionalStyle}>
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
