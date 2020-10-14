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

  console.log("!!!!!!! Creating ChatContactList !!!!!");

  const {currentUser} = useContext(GlobalContext);
  const {currentListing} = useContext(CurrentListingContext);
  const {switchChattingChannel,
    currChannelInfo,
    dmChannelContexts,
    getContactList,
    childIndex,
    chattingContextType,
    resetChatList,
    getDmChannelId} = useContext(MessageContext);

  // starting index of group chat
  const [groupChatIndex, setGroupChatIndex] = useState(-1);
  const [clickStates, setClickStates] = useState([]);

  let _groupChatIndex = -1;

  // create initial state based on friendsList
  let list_of_group_chats = [];

  const [groupChats, setGroupChats] = useState([]);

  console.log("ChatContactList: currentListing = " + JSON.stringify(currentListing));

  function  removeCurrentUserFromList(_list) {
    if (_list==null) return null;

    return _list.filter(function (_item) {
      return _item.username !== currentUser.username;
    });
  }

  let friendsList = removeCurrentUserFromList(getContactList());

  if (friendsList==null) {
    console.log("friendsList is not available yet.");
    return (
      <div/>
    );
  }

  let bFoundDefaultContact = false;

  function getInitClickValue()
  {

    let initClickStates = [];

    // ISEO-TBD:
    console.log("friendsList.length = " + friendsList.length);

    if (friendsList.length===0) {
      if (currChannelInfo.channelName!=null) switchChattingChannel({channelName: null});
    }

    for (let i=0; i< friendsList.length; i++) {
      if (friendsList[i].username===currentUser.username) {
        console.log("Skipping it");
      } else {
        console.log("ChatContactList: currChannelInfo.channelName = " + currChannelInfo.channelName);
        console.log("getDmChannelId = " + getDmChannelId(friendsList[i].username));

        if (currChannelInfo.channelName==null && !bFoundDefaultContact) {
          switchChattingChannel({channelName: getDmChannelId(friendsList[i].username)});
          bFoundDefaultContact = true;
          initClickStates.push(1);
        } else {
          if (getDmChannelId(friendsList[i].username)===currChannelInfo.channelName) {
            console.log("found default contact!!!");

            bFoundDefaultContact = true;
            initClickStates.push(1);
          } else {
            initClickStates.push(0);
          }
        }
      }
    }

    // group chatting's supported only in the posting. not in general chatting.
    if(chattingContextType>=1)
    {
      // It will store the starting index of group chat.
      if(groupChatIndex==-1 || initClickStates.length!=groupChatIndex) 
      {
        setGroupChatIndex(initClickStates.length);
      }

      if(chattingContextType==1)
      {
        list_of_group_chats = currentListing.list_of_group_chats;
      }
      else
      {
        if(currentListing.child_listings[childIndex]!=undefined)
        {
          list_of_group_chats = currentListing.child_listings[childIndex].list_of_group_chats
        }
        else
        {
          list_of_group_chats = [];
        }

      }
    
      if(list_of_group_chats.length>0)
      {
        for(let index=0; index<list_of_group_chats.length; index++)
        {
          if (currChannelInfo.channelName==null && !bFoundDefaultContact) {
            switchChattingChannel({channelName: list_of_group_chats[index].channel_id});
            bFoundDefaultContact = true;
            initClickStates.push(1);
          } else {
            if (list_of_group_chats[index].channel_id===currChannelInfo.channelName) {
              console.log("found default contact!!!");
              bFoundDefaultContact = true;
              initClickStates.push(1);
            } else {
              initClickStates.push(0);
            }
          }
        }
      }
    }

    return initClickStates;
  }

  // Now I know why!!!
  // 1. this function component is loaded in the parent level
  // 2. the same component is loaded in the child level
  // <note> the previous states still there. 
  // So we should make it sure that the states will be properly re-initialized.
  console.log("clickStates=" + JSON.stringify(clickStates));
  let initValue = getInitClickValue();
  console.log("initValue.length = " + initValue.length);
  console.log("groupChats.length=" + groupChats.length);

  if(clickStates.length!=initValue.length)
  {
    setClickStates([...initValue]);
    setGroupChats([...list_of_group_chats]);
  }

  function getChannelIdByIndex(index)
  {
    if(groupChatIndex!=-1 && index>=groupChatIndex)
    {
      return list_of_group_chats[index-groupChatIndex].channel_id;
    }
    else
    {
      return getDmChannelId(friendsList[index].username);
    }
  }

  async function handleClickState(index) {

    console.log("handleClickState, index="+index);

    // update clickStates where the index is referring to
    let contactClickStates  = [...clickStates];

    // reset all others
    for (let i=0; i< contactClickStates.length; i++) {
      contactClickStates[i] = 0;
    }

    contactClickStates[index] = 1;

    setClickStates([...contactClickStates]);

    let channelInfo = {channelName: getChannelIdByIndex(index)};

    // We need to make it sure that loadChattingDatabase should be called in sequence.
    switchChattingChannel(channelInfo, true); // second parameter tells if loadChattingDatabase is needed
    //loadChattingDatabase();
  }

  function isChatDefined(channel_name)
  {
    return (dmChannelContexts[channel_name]!=undefined);
  }

  function buildContacts() {
    let contacts = [];

    console.log("buildContacts: clickStates.length= " + clickStates.length);

    for (let i = 0; i<clickStates.length; i++) {

      if((groupChatIndex!=-1 && i<groupChatIndex) && currentUser.username===friendsList[i].username)
        continue;

      // construct channel specific information
      // 1. any indication of new message
      // : It should have been kept in context? Upon database loading.
      //   Check the last read index and the total number of messages in channel DB.
      // 2. latest message
      //
      // <note> the channel_name will be different if it's a chatting about posting.
      // peer name won't be good enough if it's related with posting
      // what's the format of channel_id?
      let channel_name = getChannelIdByIndex(i);

      let channelSummary = {flag_new_msg: isChatDefined(channel_name)? dmChannelContexts[channel_name].flag_new_msg: false,
                            timestamp:    isChatDefined(channel_name)? dmChannelContexts[channel_name].datestamp: null,
                            msg_summary:  isChatDefined(channel_name)? dmChannelContexts[channel_name].msg_summary:  ""};
      
      if(groupChatIndex!=-1 && i<groupChatIndex || groupChatIndex==-1)
      {
        contacts.push(<div key={shortid.generate()}>
          <ContactSummary contactIndex={i} clickState={clickStates[i]} 
                          clickHandler={handleClickState} user={friendsList[i]} summary={channelSummary} />
        </div>);

      }
      else
      {
        contacts.push(<div key={shortid.generate()}>
          <GroupContactSummary contactIndex={i} clickState={clickStates[i]} 
                          clickHandler={handleClickState} user={groupChats[i-groupChatIndex].friend_list} summary={channelSummary} />
        </div>);
      }
    }

    return contacts;
  }

  function clickDefaultContact() {
    if (!bFoundDefaultContact && clickStates.length >= 1) {
      bFoundDefaultContact = true;
      handleClickState(0);
    }
  }

  useEffect(()=> {
    // ISEO: dmChannelContexts are being updated by loadChatHistory but somehow ChatContactList is not being reloaded even if dmChannelContexts are being updated....WHY!!
    console.log("ChatContactList:dmChannelContexts being updated with channel name = " + currChannelInfo.channelName);
    clickDefaultContact();
  },[dmChannelContexts]);


  //ISEO-TBD: this may lead to infinite rendering
  //clickDefaultContact();
  return (
    <div>
      {buildContacts()}
    </div>
  );
}

export default ChatContactList;
