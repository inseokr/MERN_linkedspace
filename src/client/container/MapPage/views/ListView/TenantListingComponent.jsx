/* eslint-disable */
import React, { useState, useContext, useEffect } from 'react';
import emailjs from "emailjs-com";
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel';
import axios from 'axios';
import $ from 'jquery';
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import ShowActiveListingPageWrapper from '../../../ListingPage/ShowActiveListingPageWrapper';
import ChildListingsView from './ChildListingsView';
import { GlobalContext } from '../../../../contexts/GlobalContext';
import { MessageContext, MSG_CHANNEL_TYPE_LISTING_PARENT, MSG_CHANNEL_TYPE_GENERAL } from '../../../../contexts/MessageContext';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import {FILE_SERVER_URL} from '../../../../globalConstants';


function TenantListingComponent(props) {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [overlappedComponents, setOverlappedComponets] = useState(null);
  const { currentUser } = useContext(GlobalContext);
  const {
    currentListing, setCurrentListing, fetchCurrentListing, currentChildIndex,
    parentRef, setParentRef, setCurrentChildIndex, markerParams, setMarkerParams
  } = useContext(CurrentListingContext);
  const { setChattingContextType, chattingContextType, checkAnyUnreadMessages } = useContext(MessageContext);
  const { listing, toggle, mode } = props;

  if (listing === undefined) {
    console.warn('No listing available');
    return <div> no listing available </div>;
  }

  const userName = listing.requester.firstname + " " + listing.requester.lastname;
  if(userName==="") userName = listing.requester.username;

  const moveInDate = `${listing.move_in_date.month}/${listing.move_in_date.date}/${listing.move_in_date.year}`;
  const rentDuration = `${listing.rental_duration} month(s)`;
  const rentalBudget = `$${listing.rental_budget}`;
  const preferredLocation = `${listing.location.city},${listing.location.state},${listing.location.country}`;


  if (chattingContextType === MSG_CHANNEL_TYPE_GENERAL) {
    //This will be called only if chatting context is changed from general to dashboard
    setChattingContextType(MSG_CHANNEL_TYPE_LISTING_PARENT);
    toggle(true);
  }

  const borderStyle = (currentListing._id === markerParams.selectedMarkerID) ? {
    borderLeftStyle: 'solid',
    borderLeftColor: (checkAnyUnreadMessages(MSG_CHANNEL_TYPE_LISTING_PARENT, -1) === true)? 'red': '#115399',
    borderLeftWidth: '5px'
  } : (checkAnyUnreadMessages(MSG_CHANNEL_TYPE_LISTING_PARENT, -1) === true)? {
    borderLeftStyle: 'solid',
    borderLeftColor: 'red',
    borderLeftWidth: '5px'
  } : {};


  const _backGroundColor = (currentListing._id === markerParams.selectedMarkerID)? "#b0becc": "white";


  async function addChildListing(childListing) {
    // console.log("addChildListing with childListing =" + JSON.stringify(childListing));

    // 1. Need ID of current active listing
    const data = {
      parent_listing_id: listing._id,
      child_listing_id: childListing.id,
      username: currentUser.username,
      listing_type: childListing.listingType
    };

    const result = await axios.post('/LS_API/listing/tenant/addChild', data)
      .then((result) => {
        console.log(`addChildListing result = ${result}`);
        fetchCurrentListing(currentListing._id, 'tenant');
      })
      .catch(err => console.log(err));
  }

  async function removeChildListing(childListing) {
    if (currentListing.child_listings[currentChildIndex] === undefined) {
      console.warn(`currentChildIndex ${currentChildIndex} is undefined`);
      return;
    }

    console.log('removeChildListing');

    // post to DB as well
    const data = {
      parent_listing_id: listing._id,
      child_listing_id: childListing._id,
      channel_id_prefix: `${listing._id}-child-${currentListing.child_listings[currentChildIndex].listing_id._id}`,
      listing_type: childListing.listingType
    };

    const result = await axios.post('/LS_API/listing/tenant/removeChild', data)
      .then(async (result) => {
        console.log(`removeChildListing result = ${result}`);
        fetchCurrentListing(currentListing._id, 'tenant');
        handleParentOnClick();
      })
      .catch(err => console.log(err));
  }

  const showModal = () => {
    // <note> it's a permanet change, and we should recover it.
    let chattingPanelId = document.getElementById('chattingPanel');

    setOverlappedComponets({id: chattingPanelId, indexValue: chattingPanelId.style.zIndex});
    
    chattingPanelId.style.zIndex = '0';

    setModalShow(true);
  };

  const inviteFriends = async () => {
    // send e-mail notifications.
     // post to DB as well
    const data = {
      parent_listing_id: listing._id,
    };

    const result = await axios.post(`/LS_API/listing/tenant/${listing._id}/dashboard/invite`, data)
      .then(async (result) => {

        alert("Friends invited to the current dashboard");

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

  const handleClose = () => {
    setModalShow(false);
    overlappedComponents.id.style.zIndex = overlappedComponents.indexValue;
  };

  const handleSelect = (e) => {
    setIndex(e);
  };

  // ISEO-TBD: dang... this may cause a problem during reloading of the page.
  const handleParentOnClick = (e) => {
    console.log(`handleParentOnClick:chattingContextType= ${chattingContextType}`);
    if (chattingContextType !== MSG_CHANNEL_TYPE_LISTING_PARENT) {
      console.log('setting chatting context type and toggle');
      setChattingContextType(MSG_CHANNEL_TYPE_LISTING_PARENT);
      toggle(true);
    }
    setMarkerParams({ ...markerParams, selectedMarkerID: currentListing._id});
    setCurrentChildIndex(-1);
    // need to reload the message window...
  };

  const listingControl = { add: addChildListing, remove: removeChildListing };

  function addChildListingControl() {
    return (
      <div className="flex-container" style={{ justifyContent: 'space-between' }}>
        <SimpleModal show={modalShow} handle1={handleClose} caption1="Close">
          <ShowActiveListingPageWrapper type="child" listingControl={listingControl} />
        </SimpleModal>

        <button className="btn btn-info" onClick={inviteFriends}>
          Invite Friends
        </button>

        <button className="btn btn-info" onClick={showModal}>
          Add Listing
        </button>
      </div>
    );
  }

  // Create reference for the parent listing
  // <note> how to clean the reference?
  if(parentRef===null)
  {
    setParentRef(React.createRef());
  }

  return (
    <div>
      <div ref={parentRef} onClick={handleParentOnClick} id='tenantParentListing' style={{ position: 'sticky', top: '0', zIndex: '100', background: 'white'}}>
      <ListItem key={listing.requester._id}>
        <Grid container style={borderStyle}>
          <Grid item xs={4}>
            <Carousel interval={null} slide activeIndex={index} onSelect={handleSelect} className="carousel">
              {listing.profile_pictures.map(picture => (
                <Carousel.Item key={picture._id}>
                 <a href={`/listing/tenant/${listing._id}/get`} target="_blank">
                  <img src={FILE_SERVER_URL+listing.requester.profile_picture} alt={userName} className="carouselImage rounded-circle" style={{ maxWidth: '90%' }} />
                 </a>
                </Carousel.Item>
              ))}
            </Carousel>
          </Grid>
          <Grid item xs={8}>
            <Paper className="description" onClick={handleParentOnClick} style={{background: _backGroundColor}}>
              <Typography className="description__address" color="textSecondary" style={{marginBottom: '10px', textAlign: "center"}}>
                Summary of rental request
              </Typography>

                <Typography className="description__address">
                  Move-in date:
                  {' '}
                  {moveInDate}
                </Typography>

                <Typography className="description__address">
                  Location:
                  {' '}
                  {preferredLocation}
                </Typography>

              <div style={{ display: 'grid', gridTemplateColumns: "7fr 5fr" }}>
                <Typography className="description__address">
                  Rental duration: 
                  {' '}
                  {rentDuration}
                </Typography>
                <Typography className="description__address">
                  Budget:
                  {' '}
                  {rentalBudget}
                  /m
                </Typography>
              </div>
              <Typography className="description__address" color="textSecondary" style={{marginTop: '10px', marginBottom: '5px'}}>
                Posted by:
                {' '}
                {userName}
              </Typography>

              {addChildListingControl()}

            </Paper>
          </Grid>
        </Grid>
      </ListItem>
      </div>

      <ChildListingsView
        handleSelect={handleSelect}
        messageClickHandler={toggle}
        listing={listing}
        removeHandler={removeChildListing}
        chattingContextType={chattingContextType}
      />
    </div>
  );
}

export default TenantListingComponent;