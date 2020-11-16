/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../app.css';
import '../common/listing_style.css';
import axios from 'axios';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { FILE_SERVER_URL } from '../../../globalConstants';
import GetRatingDeco from '../../../components/decos/GetRatingDeco';
import FormatListItems from '../../../components/decos/FormatListItems';

function ListingTenantMainPage(props) {
  const { match, isLoggedIn } = props;
  const { fetchCurrentListing, currentListing } = useContext(CurrentListingContext);

  const [currentListingFetched, setCurrentListingFetched] = useState(false);

  useEffect(() => {
    if (match) {
      fetchCurrentListing(match.params.id, 'tenant').then((response) => {
        if (response) {
          setCurrentListingFetched(true);
        }
      });
    }
  }, [match]);

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
        <div className="_1xzp5ma3">
          Rental Preferences
        </div>

        <div className="wooden_background border rounded-top rounded-bottom" style={{ marginTop: '20px' }}>
          <div className="row sub_title" style={{ paddingTop: '8px ' }}>
            {FormatListItems(preferences, 3)}
          </div>
        </div>
      </div>
    );
  }

  function getReferringFriends() {
    console.log('getReferringFriends', currentListing);
    return (
      <div className="row">
        {currentListing.list_of_referring_friends.map((friend, index) => (
          <div className="col-3" key={friend.friend_name}>
            <div className=" thumbnail">
              <img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+friend.profile_picture} alt="friendProfilePicture" />
              <span className="_so3dpm2" style={{ marginLeft: '40px' }}>{friend.friend_name}</span>
              <div style={{ marginLeft: '60px' }}>
                {GetRatingDeco(index)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function getContactInformation() {
    return (
      <div>
        <div style={{ marginTop: '10px' }}>Contact</div>
        <div className="sub_title" style={{ marginTop: '10px ' }}>
          <ul style={{ listStyleType: 'none' }}>
            <li>
              {' '}
              Phone Number:
              {currentListing.phone}
            </li>
            <li>
              {' '}
              E-mail:
              {currentListing.email}
            </li>
          </ul>
        </div>
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
      const post_url = `/LS_API/listing/tenant/${match.params.id}/forward`;
      await axios.post(post_url).then((result) => {
        console.log(`result = ${result.data.result}`);
        alert(`Result = ${result.data.result}`);
      })
        .catch((err) => {
          console.log(err);
        });
    }

    return (
      <div style={{ marginTop: '30px' }}>
        <input type="text" defaultValue="Hello World" id="post_link" style={{ color: 'white', borderStyle: 'none' }} />
        <div className="d-flex justify-content-start">
          <button className="btn btn-primary" onClick={() => copyCurrentUrl}>Copy link of this posting</button>

          <button className="btn btn-info" style={{ marginLeft: '70px ' }} onClick={() => forward2friend()}>Send listing to friends</button>
          <Link to={`/listing/tenant/${match.params.id}/dashboard`}>
            <button className="btn btn-danger" style={{ marginLeft: '70px ' }}>Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const footer = '';
  let rentalUnitType = '';
  let profile_picture = '';
  let profile_caption = '';

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

            <div className="col-3" style={{ height: '600px', marginLeft: '30px', border: 'none' }}>
              <img
                src={FILE_SERVER_URL+profile_picture}
                align="right"
                style={{
                  width: '100%', maxHeight: '100%', objectFit: 'cover', objectPosition: '100% 0%'
                }}
                alt="profilePicture"
              />
              <div className="border border-top-0" style={{ textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                {' '}
                {profile_caption}
                {' '}
              </div>
            </div>

            <div className="col-5" style={{ borderStyle: 'none ', height: '500px', marginLeft: '30px' }}>
              <div className="sub_title" style={{ textAlign: 'center', marginTop: '20px' }}>
                Self-introduction
              </div>
              <div className="_1ezjrwzo" style={{ marginTop: '20px' }}>
                {currentListing.rental_description}
              </div>
            </div>

            <div
              className="col-3 wooden_background border"
              style={{
                textAlign: 'center', borderStyle: 'none ', height: '600px', marginLeft: '30px'
              }}
            >

              <div className="sub_title" style={{ marginTop: '20px' }}>
                Preferred Location
              </div>
              <div className="_1ezjrwzo">
                {currentListing.location.city}
                ,
                {currentListing.location.state}
                ,
                {currentListing.location.country}
                ,
                {currentListing.location.zipcode}
              </div>


              <div className="sub_title" style={{ marginTop: '20px ' }}>
                Distance Range Allowed
              </div>
              <div className="_1ezjrwzo">
                {currentListing.maximum_range_in_miles}
                {' '}
                miles
              </div>

              <div className="sub_title" style={{ marginTop: '20px ' }}>
                Budget
              </div>
              <div className="_1ezjrwzo">
                $
                {currentListing.rental_budget}
                .00
              </div>

              <div className="sub_title" style={{ marginTop: '20px ' }}>
                Move-in Date
              </div>
              <div className="_1ezjrwzo">
                {currentListing.move_in_date.month}
                /
                {currentListing.move_in_date.date}
                /
                {currentListing.move_in_date.year}
              </div>

              <div className="sub_title" style={{ marginTop: '20px ' }}>
                Rental Duration
              </div>
              <div className="_1ezjrwzo">
                {currentListing.rental_duration}
                {' '}
                months
              </div>

              <div className="sub_title" style={{ marginTop: '20px ' }}>
                Preferred rental unit type
              </div>
              <div className="_1ezjrwzo">
                {currentListing.rental_preferences.rental_unit_type}
              </div>

              <div className="sub_title" style={{ marginTop: '20px ' }}>
                Number of rooms or Whole Unit?
              </div>
              <div className="_1ezjrwzo">
                {rentalUnitType}
              </div>

              {getNumOfRoomMates()}

            </div>
            <div className="container" style={{ borderStyle: 'none ', marginTop: '40px' }}>
              <hr />
              {getRentalPreference()}
              <hr />

              <div className="_1xzp5ma3" style={{ marginTop: '40px', marginLeft: '20px' }}>
                Referring Mutual Friends
              </div>

              <div className="row" style={{ marginTop: '30px' }}>
                <div className="col-7 wooden_background border rounded-top rounded-bottom">
                  {getReferringFriends()}
                </div>

                <div className="col-lg-4 sub_title wooden_background border rounded-top rounded-bottom" style={{ maxHeight: '102px', textAlign: 'center', marginLeft: '80px ' }}>
                  {getContactInformation()}
                </div>
              </div>

              {getListingControls()}
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
