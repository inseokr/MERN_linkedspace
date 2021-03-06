/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import {useHistory} from 'react-router-dom'
import axios from 'axios';

import '../../../app.css';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { GlobalContext } from '../../../contexts/GlobalContext';
import SelectionFromDirectFriends from '../../../components/Selection/SelectionFromDirectFriends';
import SimpleModal from '../../../components/Modal/SimpleModal';


function ListingControlButtons() {
  try {
  const { currentListing } = useContext(CurrentListingContext);
  const { currentUser } = useContext(GlobalContext);
  const [modalShow, setModalShow] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const history = useHistory();

  const checkIfOwner = ()=> {
    try {
      if (currentListing.listing.requester===undefined || currentUser===undefined) {
        return false;
      }
      return (currentListing.listing.requester._id === currentUser._id);
    } catch(err) {
      console.warn(err);
      return false;
    }
  };

  useEffect(() => {
    setIsOwner(checkIfOwner());
  }, [currentListing]);

  useEffect(() => {
    setIsOwner(checkIfOwner());
  }, [currentUser]);



  function copy_posting_link(evt) {
    console.log('copy_posting_link clicked');
    /* Get the text field */
    const copyText = document.getElementById('post_link');
    copyText.value = window.location.href;
    copyText.select();

    document.execCommand('copy');
    alert(`Copied the URL: ${window.location.href}`);
  }

  async function forward2friend() {

    const data = {
      userList: selectedUsers
    };

    const post_url = `/LS_API/listing/landlord/${currentListing.list_id}/forward`;
    await axios.post(post_url, data).then(async (result) => {
      console.log(`result = ${result.data.result}`);
      alert(`Result = ${result.data.result}`);
      // ISEO-TBD:
      // let's check why SelectionFromDirectFriends is not refreshed yet.
      let res = fetchCurrentListing(currentListing._id, 'tenant');
      setModalShow(false);
    })
      .catch((err) => {
        console.log(err);
        setModalShow(false);
      });
  }

  function handleAddUser(userId) {
    let _selectedUsers = selectedUsers;
    _selectedUsers.push(userId);
    setSelectedUsers(_selectedUsers);
  }

  function handleRemoveUser(userId) {
    let _selectedUsers = selectedUsers.filter(_id => userId!==_id);
    setSelectedUsers(_selectedUsers);
  }

  function showForwardWindow() {
    setModalShow(true);
  }

  function handleCancel() {
    setModalShow(false);
  }



  const controlButtons = currentListing.list_id !== 0
    ? (
      <div style={{ marginTop: '30px' }}>
        <input type="text" defaultValue="Hello World" id="post_link" style={{ color: 'white', borderStyle: 'none' }} />
        {/* The button used to copy the text */}
        <SimpleModal show={modalShow} handle1={forward2friend} caption1="Forward" handle2={handleCancel} caption2="Cancel" styles={{width: '20%', height: 'auto'}}>
          <SelectionFromDirectFriends show={modalShow} filter={currentListing.listing.shared_user_group} handleAddUser={handleAddUser} handleRemoveUser={handleRemoveUser} title="Please select users"/>
        </SimpleModal>
        <div className="d-flex justify-content-around">
          {isOwner===true &&
          <button className="btn btn-outline-dark" onClick={() => history.push('/ActiveListing')} value={currentListing.list_id}>My Postings</button>
          }
          {isOwner===false &&
          <button className="btn btn-outline-dark" onClick={() => history.push('/ShowListingFromFriends')} value={currentListing.list_id}>Posting From Friends</button>
          }

          <button className="btn btn-outline-dark" onClick={() => showForwardWindow()} style={{ marginLeft: '70px !important' }}>Forward it to Friends</button>
          {isOwner===true &&
          <form role="form" action={'/LS_API/listing/landlord/'+currentListing.list_id+'/edit'} method="post">
            <div className="action">
            <button className="btn btn-outline-dark" style={{ marginLeft: '70px !important' }}>Edit Listing</button>
            </div>
          </form>}
        </div>
      </div>
    ) : '';

    if (currentUser === null || currentUser === undefined) {
      return (
        <React.Fragment> </React.Fragment>
      );
    }
    else {
      return (
        <div>
          {controlButtons}
        </div>
      );
    }

  } catch(err) {
    console.warn(err);
    return (
      <React.Fragment> </React.Fragment>
    );
  }
  
}

export default ListingControlButtons;
