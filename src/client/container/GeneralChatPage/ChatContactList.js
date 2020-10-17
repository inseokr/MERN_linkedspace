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

  //console.log("!!!!!!! Creating ChatContactList !!!!!");

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

  let bFoundDefaultContact = false;
  // create initial state based on friendsList
  let list_of_group_chats = [];
  let _groupChatIndex = -1;


  function getInitClickValue()
  {
    let initClickStates = [];
    _groupChatIndex = -1;
    bFoundDefaultContact=false;

    //console.log("getInitClickValue: called");

    if (friendsList.length===0) {
      if (currChannelInfo.channelName!=null) switchChattingChannel({channelName: null});
    }

    // <note> this should be done when there is a change in currChannelInfo.
    for (let i=0; i< friendsList.length; i++) {
      if (friendsList[i].username===currentUser.username) {
        //console.log("Skipping it");
      } else {
        //console.log("ChatContactList: currChannelInfo.channelName = " + currChannelInfo.channelName);
        //console.log("getDmChannelId = " + getDmChannelId(friendsList[i].username));

        if (currChannelInfo.channelName==null && bFoundDefaultContact==false) {
          switchChattingChannel({channelName: getDmChannelId(friendsList[i].username)});
          bFoundDefaultContact = true;
          initClickStates.push(1);
        } else {

          //console.log("current channel name = "+ currChannelInfo.channelName);

          if (getDmChannelId(friendsList[i].username)===currChannelInfo.channelName) {
            //console.log("found default contact!!!");
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
      _groupChatIndex = initClickStates.length;

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
              //console.log("found default contact!!!");
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


  function  removeCurrentUserFromList(_list) {
    if (_list==null) return null;

    return _list.filter(function (_item) {
      return _item.username !== currentUser.username;
    });
  }

  let friendsList = removeCurrentUserFromList(getContactList());

  if (friendsList==null) {
    //console.log("friendsList is not available yet.");
    return (
      <div/>
    );
  }

  // 1. get the list_of_group_chats
  if(chattingContextType>=1)
  {
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
  }

  const [clickStates, setClickStates] = useState(getInitClickValue());


  function getChannelIdByIndex(index)
  {
    if(_groupChatIndex!=-1 && index>=_groupChatIndex)
    {
      return list_of_group_chats[index-_groupChatIndex].channel_id;
    }
    else
    {
      return getDmChannelId(friendsList[index].username);
    }
  }

  async function handleClickState(index) {

    //console.log("handleClickState, index="+index);
    //console.log("handleClickState, _groupChatIndex="+_groupChatIndex);

    // update clickStates where the index is referring to
    let contactClickStates  = [...clickStates];

    // reset all others
    for (let i=0; i< contactClickStates.length; i++) {
      contactClickStates[i] = 0;
    }

    contactClickStates[index] = 1;

    setClickStates([...contactClickStates]);

    let _members = [];

    if(_groupChatIndex==-1 || index<_groupChatIndex)
    {
      _members.push(friendsList[index].username);
    } 
    else
    {
      if(_groupChatIndex!=-1)
      {
        for(let i=0; i<list_of_group_chats[index-_groupChatIndex].friend_list.length; i++)
        {
          _members.push(list_of_group_chats[index-_groupChatIndex].friend_list[i].username);
        }
      }
    }

    let channelInfo = {channelName: getChannelIdByIndex(index), members: _members};

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

    //console.log("buildContacts: clickStates.length= " + clickStates.length);

    for (let i = 0; i<clickStates.length; i++) {

      if((_groupChatIndex!=-1 && i<_groupChatIndex) && currentUser.username===friendsList[i].username)
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
      
      if(_groupChatIndex!=-1 && i<_groupChatIndex || _groupChatIndex==-1)
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
                          clickHandler={handleClickState} user={list_of_group_chats[i-_groupChatIndex].friend_list} summary={channelSummary} />
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
    //console.log("ChatContactList: useEffect by dmChannelContexts");
    clickDefaultContact();
  },[dmChannelContexts]);


  useEffect(()=> {
    //console.log("ChatContactList: useEffect by chattingContextType get init value again");
    // need to recreate the clickStates
    setClickStates(getInitClickValue(), ()=> {clickDefaultContact()});
    //clickDefaultContact();

  }, [chattingContextType, currChannelInfo]);

  useEffect(()=> {

    //console.log("ChatContactList: useEffect by clickStates");
    //console.log("ChatContactList: useEffect by clickStates=" + JSON.stringify(clickStates));
    clickDefaultContact();

  }, [clickStates]);


  //console.log("render: clickStates=" + JSON.stringify(clickStates));

  return (
    <div>
      {buildContacts()}
    </div>
  );
}

export default ChatContactList;
