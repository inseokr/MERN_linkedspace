/* eslint-disable */
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';
import SelectionFromDirectFriends from '../../components/Selection/SelectionFromDirectFriends';
import SimpleModal from '../../components/Modal/SimpleModal';


function Invite2DashboardModal(props) {
  try
  {
    const {listing_id, modalState, setModalState} = props;
    const { currentListing } = useContext(CurrentListingContext);
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

    const inviteFriends = async () => {
    // send e-mail notifications.
     // post to DB as well
    const data = {
      parent_listing_id: listing_id,
      invitee: selectedUsers
    };

    const result = await axios.post(`/LS_API/listing/tenant/${listing_id}/dashboard/invite`, data)
      .then(async (result) => {

        alert("Friends invited to the current dashboard");

        setModalState(false);

        if(result.data!==null)
        {
          let bSendEmail = false;

          result.data.forEach((user, index)=>{

            if(user.username!==currentUser.username)
            {
              // send test email from ReactJs
              var templateParams = {
                to_email: user.email,
                from_name: 'LikedSpaces',
                to_name: user.username,
                message: user.message
              };

              if(bSendEmail===true)
              {
                emailjs.send('service_0ie0oe5', 'template_r2bn5e6', templateParams, 'user_dvV4OqqT5zASBx61ZIPdf')
                .then(function(response) {
                   console.log('SUCCESS!', response.status, response.text);
                }, function(error) {
                   console.log('FAILED...', error);
                });
              }
              else
              {
                console.warn("Sending notification to " + JSON.stringify(user));
              }
            }
          })
        }
      })
      .catch(err => console.log(err));
    };


    return (
      <SimpleModal show={modalState} handle1={inviteFriends} caption1="Invite" handle2={handleCancel} caption2="Cancel" styles={{width: '20%', height: 'auto'}}>
        <SelectionFromDirectFriends show={modalState} filter={[]} handleAddUser={handleAddUser} handleRemoveUser={handleRemoveUser} title="Please select users"/>
      </SimpleModal>
    );
  }
  catch(error)
  {
    console.warn("error = " + error);
    return (<React.Fragment></React.Fragment>)
  }

}

export default Invite2DashboardModal;
