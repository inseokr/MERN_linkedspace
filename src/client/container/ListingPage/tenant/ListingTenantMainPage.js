/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import '../../../app.css';
import '../common/listing_style.css';
import axios from 'axios';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { GlobalContext } from '../../../contexts/GlobalContext';
import SimpleModal from '../../../components/Modal/SimpleModal';
import SelectionFromDirectFriends from '../../../components/Selection/SelectionFromDirectFriends'
import { FILE_SERVER_URL } from '../../../globalConstants';
import GetRatingDeco from '../../../components/decos/GetRatingDeco';
import FormatListItems from '../../../components/decos/FormatListItems';

function ListingTenantMainPage(props) {
  const { match, isLoggedIn } = props;
  const { fetchCurrentListing, currentListing } = useContext(CurrentListingContext);
  const { currentUser, refreshUserData } = useContext(GlobalContext);
  const [currentListingFetched, setCurrentListingFetched] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  function checkIfOwner() {
    try {
      if(currentListing===undefined){
        return false;
      } 
      else
      {
        return (currentListing.requester._id==currentUser._id);
      }
    } catch(err) {
      console.warn(`err`);      
      return false;
    }
  }

  const [isOwner, setIsOwner] = useState(checkIfOwner());


  function handleAddUser(userId) {
    let _selectedUsers = selectedUsers;
    _selectedUsers.push(userId);
    setSelectedUsers(_selectedUsers);
  }

  function handleRemoveUser(userId) {
    let _selectedUsers = selectedUsers.filter(_id => userId!==_id);
    setSelectedUsers(_selectedUsers);
  }

  useEffect(() => {
    if (match) {
      fetchCurrentListing(match.params.id, 'tenant').then((response) => {
        if (response) {
          setCurrentListingFetched(true);
        }
      });
    }
  }, [match]);

  useEffect(() => {
    setIsOwner(checkIfOwner());
  }, [currentListing]);

  function getNumOfRoomMates() {
    if (currentListing.num_of_requested_roommates > 0) {
      return (
        <div>
          <div className="sub_title" style={{ marginTop: '20px' }}>
            Additional tenant?
          </div>
          <div className="_1ezjrwzo">
            {currentListing.num_of_requested_roommates}
          </div>
        </div>
      );
    }
    return null;
  }

  function getRentalPreference() {
    function preprocessingListing(listing, preferences) {
      if (listing.rental_preferences.furnished !== 'off') {
        preferences.push('Furnished');
      }

      if (listing.rental_preferences.kitchen !== 'off') {
        preferences.push('Kitchen');
      }

      if (listing.rental_preferences.parking !== 'off') {
        preferences.push('Parking');
      }

      if (listing.rental_preferences.internet !== 'off') {
        preferences.push('Internet');
      }

      if (listing.rental_preferences.private_bathroom !== 'off') {
        preferences.push('Private Bathroom');
      }

      if (listing.rental_preferences.separate_access !== 'off') {
        preferences.push('Separate Entrance');
      }

      if (listing.rental_preferences.smoking_allowed !== 'off') {
        preferences.push('Smoke Friendly');
      }

      if (listing.rental_preferences.pet_allowed !== 'off') {
        preferences.push('Pet Allowed');
      }

      if (listing.rental_preferences.easy_access_public_transport !== 'off') {
        preferences.push('Easy Access to Public Transport');
      }
    }

    const preferences = [];

    preprocessingListing(currentListing, preferences);

    return (
      <div>
        <div className="_lsFont1" style={{textAlign: 'center'}}>
          Rental Preferences
        </div>

        <div className="shadowedTile" style={{ marginTop: '20px' }}>
          <div className="row sub_title" style={{ paddingTop: '8px ' }}>
            {FormatListItems(preferences, 3)}
          </div>
        </div>
      </div>
    );
  }

  function getFriends() {

    let friendList = [];

    if(isOwner===true)
    {
      // remove itself from the shared_user_group
      let adjustedFriendList = []
      for(let index=0; index<currentListing.shared_user_group.length ; index++)
      {
        if(currentListing.shared_user_group[index]._id!=currentUser._id)
        {
          adjustedFriendList.push(currentListing.shared_user_group[index]);
        }
      }
      friendList = adjustedFriendList;
    }
    else
    {
      friendList = currentListing.list_of_referring_friends;
    }

    return (
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
        {friendList.map((friend, index) => (
          <div className=" thumbnail">
            <img className="img-responsive center rounded-circle" style={{maxHeight:'50px', maxWidth: '50px'}} src={FILE_SERVER_URL+friend.profile_picture} alt="friendProfilePicture" />
            <span className="_so3dpm2" style={{ marginLeft:'7%' }}>{friend.username}</span>
          </div>
        ))}
      </div>
    );
  }


  function getContactInformation() {
    return (
        <div style={{ marginTop: '10px ', marginLeft: '-40px' }}>
          <ul style={{ listStyleType: 'none' }}>
            <li>
              <div style={{display:'flex'}}>
                <svg style={{height: '20px', width: '20px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="mobile-alt" class="svg-inline--fa fa-mobile-alt fa-w-10" role="img" viewBox="0 0 320 512"><path fill="currentColor" d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm112-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z"/>
                </svg>
                <section className='_lsFont2' style={{marginTop:'4px'}}> {currentListing.phone} </section>
              </div>
            </li>
            <li>
              <div style={{display:'flex'}}>
                <svg style={{height: '18px', width: '18px', marginLeft: '3px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="far" data-icon="envelope" class="svg-inline--fa fa-envelope fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z"/>
                </svg>
                <section className='_lsFont2' style={{marginTop: '0px'}}> {currentListing.email} </section>
              </div>
            </li>
          </ul>
        </div>
    );
  }

  function copyCurrentUrl() {
    const copyText = document.getElementById('post_link');
    copyText.value = window.location.href;

    copyText.select();
    copyText.setSelectionRange(0, 99999); /* for mobile devices */

    document.execCommand('copy');

    alert(`Copied the URL: ${window.location.href}`);
  }


  function getListingControls() {
    if (!isLoggedIn) {
      return (
        <React.Fragment> </React.Fragment>
      );
    }

    async function forward2friend() {

      const data = {
        userList: selectedUsers     
      }

      const post_url = `/LS_API/listing/tenant/${match.params.id}/forward`;
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

    function showForwardWindow() {
      setModalShow(true);
    }

    function handleCancel() {
      setModalShow(false);
    }

    return (
      <div style={{ marginTop: '30px' }}>
        <SimpleModal show={modalShow} handle1={forward2friend} caption1="Forward" handle2={handleCancel} caption2="Cancel" styles={{width: '20%', height: 'auto'}}>
          <SelectionFromDirectFriends show={modalShow} filter={currentListing.shared_user_group} handleAddUser={handleAddUser} handleRemoveUser={handleRemoveUser} title="Please select users"/>
        </SimpleModal>
        <input type="text" defaultValue="Hello World" id="post_link" style={{ color: 'white', borderStyle: 'none' }} />
        <div className="d-flex justify-content-start">
          {isOwner===true && 
          <button className="btn btn-outline-dark" onClick={() => history.push('/ActiveListing')}>My Postings</button>}
          {isOwner===false && 
          <button className="btn btn-outline-dark" onClick={() => history.push('/ShowListingFromFriends')}>Postings From Friends</button>}
          <button className="btn btn-outline-dark" style={{ marginLeft: '70px ' }} onClick={() => showForwardWindow()}>Forward it to friends</button>
          <Link to={`/listing/tenant/${match.params.id}/dashboard`}>
            <button className="btn btn-outline-dark" style={{ marginLeft: '70px ' }}>Dashboard</button>
          </Link>
          { isOwner===true &&
          <form role="form" action={'/LS_API/listing/tenant/'+match.params.id+'/edit'} method="post" target="_blank">
            <div class="action">
              <button className="btn btn-outline-dark" style={{marginLeft: '70px '}}>Edit Listing</button>
            </div>
          </form>}
        </div>
      </div>
    );
  }

  const footer = '';
  let rentalUnitType = '';
  let profile_picture = '';
  let profile_caption = '';
  let captionListOfFriends = (isOwner===true)? 'Friends shared with this posting' : 'Referring Friends';
  const history = useHistory();

  if (currentListingFetched) {
    rentalUnitType = (currentListing.rental_preferences.rent_whole_unit === 'off') ? `${currentListing.rental_preferences.num_of_rooms} Bedroom(s)` : 'Whole Unit';
    profile_picture = (currentListing.profile_pictures[0]) ? currentListing.profile_pictures[0].path : '';
    profile_caption = (currentListing.profile_pictures[0]) ? currentListing.profile_pictures[0].caption : '';
  }

  return (
    <div>
      {(currentListingFetched) ? (
        <div>
          <div className="row">
            <div className="col-3" style={{ display: 'flex', flexDirection: 'column', minHeight: '350px', marginLeft: '30px', border: 'none' }}>
              <img
                src={FILE_SERVER_URL+profile_picture}
                align="right"
                style={{
                  width: '100%', maxHeight: '100%', objectFit: 'cover', objectPosition: '100% 0%'
                }}
                alt="profilePicture"
              />
              {getContactInformation()}
            </div>

            <div className="col-5" style={{ borderStyle: 'none ', minHeight: '350px', marginLeft: '30px' }}>
              <div className="_lsFont1" style={{ textAlign: 'center', marginTop: '20px' }}>
                Self Introduction
              </div>
              <div className="_1ezjrwzo" style={{ marginTop: '20px' }}>
                {currentListing.rental_description}
              </div>
            </div>
    
            <div
              className="col-3 shadowedTile"
              style={{
                textAlign: 'left',
                maxHeight: '270px',
                marginTop: '10px',
                marginLeft: '30px'
              }}
            >
              <div className="sub_title" style={{textAlign: 'center', marginBottom: '20px'}}> Rental Summary </div>

              <section style={{display: 'flex'}}>
              <div className="_lsFont1">
                Budget: 
              </div>
              <div className="_lsFont2">
                $
                {currentListing.rental_budget}
                .00 per month
              </div>
              </section>

              <section style={{display: 'flex'}}>
              <div className="_lsFont1">
                Move-in Date: 
              </div>
              <div  className="_lsFont2">
                {currentListing.move_in_date.month}
                /
                {currentListing.move_in_date.date}
                /
                {currentListing.move_in_date.year}
              </div>
              </section>

              <section style={{display: 'flex'}}>
              <div className="_lsFont1">
                Rental Duration:
              </div>
              <div className="_lsFont2">
                {currentListing.rental_duration}
                {' '}
                months
              </div>
              </section>

              <section style={{display: 'flex'}}>
              <div className="_lsFont1">
                Preferred rental unit type:
              </div>
              <div className="_lsFont2">
                {currentListing.rental_preferences.rental_unit_type}
              </div>
              </section>

              <section style={{display: 'flex'}}>
              <div className="_lsFont1">
                Number of rooms or Whole Unit?
              </div>
              <div className="_lsFont2">
                {rentalUnitType}
              </div>
              </section>

              <section style={{display: 'flex'}}>
                <div className="_lsFont1">
                  Preferred Location:
                </div>
                <div className="_lsFont2">
                  {currentListing.location.city}
                  ,
                  {currentListing.location.state}
                  ,
                  {currentListing.location.country}
                  ,
                  {currentListing.location.zipcode}
                </div>
              </section>

              <section style={{display: 'flex'}}>
              <div className="_lsFont1">
                Distance Range Allowed:
              </div>
              <div className="_lsFont2">
                {currentListing.maximum_range_in_miles}
                {' '}
                miles
              </div>
              </section>
              {getNumOfRoomMates()}

            </div>
            <div style={{marginLeft: '28%'}}>
            {getListingControls()}
            </div>

            
            <div className="container" style={{ borderStyle: 'none ', marginTop: '50px' }}>
              <hr />
              {getRentalPreference()}
              <hr />

              <div className="_lsFont1" style={{ marginTop: '40px', textAlign: 'center' }}>
                {captionListOfFriends}
              </div>

              <div className="row" style={{ marginTop: '30px' }}>
                <div className="col-12 shadowedTile">
                  {getFriends()}
                </div>
              </div>

            </div>
          </div>

          {footer}
        </div>
      ) : (
        <div className="loader" />
      )}
    </div>
  );
}

export default ListingTenantMainPage;
