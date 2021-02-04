/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';
  import SelectionFromDirectFriends from '../../components/Selection/SelectionFromDirectFriends';
import SimpleModal from '../../components/Modal/SimpleModal';


function ForwardTenantListingModal(props) {
  try
  {
    const {listing_id, modalState, setModalState} = props;
    const { fetchCurrentListing, currentListing } = useContext(CurrentListingContext);
    const [selectedUsers, setSelectedUsers] = useState([]);

    function handleAddUser(userId) {
      let _selectedUsers = selectedUsers;
      _selectedUsers.push(userId);
      setSelectedUsers(_selectedUsers);
    }

    function handleRemoveUser(userId) {
      let _selectedUsers = selectedUsers.filter(_id => userId!==_id);
      setSelectedUsers(_selectedUsers);
    }

    function handleCancel() {
      setModalState(false);
    }

    async function forward2friend() {

      const data = {
        userList: selectedUsers     
      }

      const post_url = `/LS_API/listing/tenant/${listing_id}/forward`;

      await axios.post(post_url, data).then(async (result) => {
        console.log(`result = ${result.data.result}`);
        alert(`Result = ${result.data.result}`);
        // ISEO-TBD:
        // let's check why SelectionFromDirectFriends is not refreshed yet.
        let res = fetchCurrentListing(currentListing._id, 'tenant');
        setModalState(false);

      })
        .catch((err) => {
          console.log(err);
          setModalState(false);
        });
    }

    return (
      <SimpleModal show={modalState} handle1={forward2friend} caption1="Forward" handle2={handleCancel} caption2="Cancel" styles={{width: '20%', height: 'auto'}}>
        <SelectionFromDirectFriends show={modalState} filter={currentListing.shared_user_group} handleAddUser={handleAddUser} handleRemoveUser={handleRemoveUser} title="Please select users"/>
      </SimpleModal>
    );
  }
  catch(error)
  {
    console.warn("error = " + error);
    return (<React.Fragment></React.Fragment>)
  }

}

export default ForwardTenantListingModal;
