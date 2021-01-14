/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import shortid from 'shortid';
import '../../app.css';
import { FILE_SERVER_URL } from '../../globalConstants';
import './SelectionFromDirectFriends.css';
import { GlobalContext } from '../../contexts/GlobalContext';

function SelectionFromDirectFriends(props) {
  try
  {
    const {filter, handleAddUser, handleRemoveUser, title} = props;

    // <note> friendsList doesn't include current user.
    const { friendsList, getProfilePicture } = useContext(GlobalContext);
    const [toggleMode, setToggleMode] = useState('select');

    function checkIfInTheFilter(_id) {
      for(let index=0; index<filter.length; index++)
      {
        if(filter[index]._id==_id)
        {
          return true;
        } 
      }

      return false;
    }

    function buildAdjustedFriendList() {
      let _adjustedFriendList = [];

      for(let index=0; index<friendsList.length; index++)
      {
        if(checkIfInTheFilter(friendsList[index]._id)===false) 
        {
          _adjustedFriendList.push(friendsList[index]); 
        }
      }
      return _adjustedFriendList;
    }

    const [adjustedFriendList, setAdjustedFriendList] = useState(buildAdjustedFriendList());

    const initClickStates = new Array(adjustedFriendList.length).fill(0);

    const [clickStates, setClickStates] = useState(initClickStates);

    const Header = (
      <div className="boldHeader">
        {' '}
        <h4> {title} </h4>
        {' '}
        <hr />
        {' '}
      </div>
    );

    async function handleClickFriend(_friend, index) {
      const tempClickStates = [...clickStates];

      if (clickStates[index] == 1) {
        handleRemoveUser(_friend._id);
        tempClickStates[index] = 0;
      } else {
        handleAddUser(_friend._id);
        tempClickStates[index] = 1;
      }

      setClickStates(tempClickStates);
    }

    function getFriend(_friend, index) {

      const _style = (clickStates[index] == 1) ? 'friendWrapperClicked' : 'friendWrapper';

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
          </div>
          <hr />
        </div>
      );
    }

    function getListOfFriends() {
      if(adjustedFriendList.length===0)
      {
        return <div>Listing has been shared with all friends</div>
      }
      else
      {
        // go through the list of direct friends
        return adjustedFriendList.map(((friend, index) => getFriend(friend, index)));
      }
    }

    function toggleSelectAll() {

      const tempClickStates = [...clickStates];

      if(toggleMode==='select')
      {
        // select all users
        tempClickStates.forEach((state, index) => {
          if(state===0)
          {
            handleAddUser(adjustedFriendList[index]._id);
            tempClickStates[index] = 1;
          }
        });
        setToggleMode('deselect');
      }
      else
      {
        // deselect all users
        tempClickStates.forEach((state, index) => {
          if(state===1)
          {
            handleRemoveUser(adjustedFriendList[index]._id);
            tempClickStates[index] = 0;
          }
        });
        setToggleMode('select');

      }

      setClickStates(tempClickStates);
    }

    useEffect(() => {
    });

    return (
      <div className="container">
        {Header}
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '5px'}}>
          <button className="btn btn-warning" onClick={toggleSelectAll} style={{ marginBottom: '5px' }}>Select or Deselect All</button>
        </div>
        {getListOfFriends()}
      </div>
    );
  }
  catch(error)
  {
    console.warn("error = " + error);
    return (<React.Fragment></React.Fragment>)
  }

}

export default SelectionFromDirectFriends;
