/* eslint-disable */
import React, { useState, useContext, useEffect } from 'react';
import {useHistory} from 'react-router-dom';
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
import ForwardTenantListingModal from '../../../../components/Listing/ForwardTenantListingModal';
import Invite2DashboardModal from '../../../../components/Listing/Invite2DashboardModal';
import ShowActiveListingPageWrapper from '../../../ListingPage/ShowActiveListingPageWrapper';
import ChildListingsView from './ChildListingsView';
import { GlobalContext } from '../../../../contexts/GlobalContext';
import { MessageContext, MSG_CHANNEL_TYPE_LISTING_PARENT, MSG_CHANNEL_TYPE_GENERAL, MSG_CHANNEL_TYPE_LISTING_CHILD } from '../../../../contexts/MessageContext';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import {FILE_SERVER_URL} from '../../../../globalConstants';


function TenantListingComponent(props) {
  const history = useHistory();
  const { currentUser, currentDashboardUrl, setCurrentDashboardUrl } = useContext(GlobalContext);
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState((currentDashboardUrl!==null)? true: false);
  const [overlappedComponents, setOverlappedComponets] = useState(null);
  const [showForwardListingModal, setShowForardListingModal] = useState(false);
  const [showMeetingRequestModal, setShowMeetingRequestModal] = useState(false);
  const {
    currentListing, fetchCurrentListing, currentChildIndex,
    parentRef, setParentRef, setCurrentChildIndex, markerParams, setMarkerParams
  } = useContext(CurrentListingContext);
  const { setChattingContextType, chattingContextType, checkAnyUnreadMessages, toggleCollapse} = useContext(MessageContext);

  // Create reference for the parent listing
  // <note> how to clean the reference?
  useEffect(() => {
    if(parentRef===null)
    {
      setParentRef(React.createRef());
    }
  }, [currentListing])

  const { listing} = props;

  if (listing === undefined || listing.requester === undefined) {
    return <div> no listing available </div>;
  }

  let userName = listing.requester.firstname + " " + listing.requester.lastname;
  if (userName === "") userName = listing.requester.username;

  const moveInDate = `${listing.move_in_date.month}/${listing.move_in_date.date}/${listing.move_in_date.year}`;
  const rentDuration = `${listing.rental_duration} month(s)`;
  const rentalBudget = `$${listing.rental_budget}`;
  const preferredLocation = `${listing.location.city},${listing.location.state},${listing.location.country}`;

  // This is for parent border
  const borderStyle = (chattingContextType===MSG_CHANNEL_TYPE_LISTING_PARENT) ? {
    borderLeftStyle: 'solid',
    borderLeftColor: (checkAnyUnreadMessages(MSG_CHANNEL_TYPE_LISTING_PARENT, -1) === true)? 'red': '#115399',
    borderLeftWidth: '5px'
  } : (checkAnyUnreadMessages(MSG_CHANNEL_TYPE_LISTING_PARENT, -1) === true)? {
    borderLeftStyle: 'solid',
    borderLeftColor: 'red',
    borderLeftWidth: '5px'
  } : {};


  const _backGroundColor = (chattingContextType===MSG_CHANNEL_TYPE_LISTING_PARENT)? "#b0becc": "white";

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
    // let's clear the URL
    setCurrentDashboardUrl(null);
    if(overlappedComponents!==null)
    {
      overlappedComponents.id.style.zIndex = overlappedComponents.indexValue;
    }
  };

  const handleSelect = (e) => {
    setIndex(e);
  };

  const redirectTo3rdparty = () => {
    // 1. store current dashboard URL
    const _dashboardUrl = `/listing/tenant/${currentListing._id}/dashboard`;
    setCurrentDashboardUrl(_dashboardUrl);

    // 2. close the current modal
    setModalShow(false);

    // 3. move to creation of 3rd party listing
    history.push(`/3rdParty`);
  };

  // ISEO-TBD: dang... this may cause a problem during reloading of the page.
  const handleParentOnClick = (e) => {
    //console.log(`handleParentOnClick:chattingContextType= ${chattingContextType}`);
    if (chattingContextType !== MSG_CHANNEL_TYPE_LISTING_PARENT) {
      //console.log('setting chatting context type and toggle');
      setChattingContextType(MSG_CHANNEL_TYPE_LISTING_PARENT);
    }
    setMarkerParams({ ...markerParams, selectedMarkerID: currentListing._id});
    setCurrentChildIndex(-1);
    // need to reload the message window...
  };

  const listingControl = { add: addChildListing, remove: removeChildListing };

  function DashboardControl() {
    return (
      <div className="flex-container" style={{ justifyContent: 'space-between' }}>
        <SimpleModal show={modalShow} handle1={redirectTo3rdparty} caption1="Create New Posting" handle2={handleClose} caption2="Close">
          <ShowActiveListingPageWrapper type="child" modal="true" listingControl={listingControl} />
        </SimpleModal>
        <ForwardTenantListingModal listing_id={currentListing._id} modalState={showForwardListingModal} setModalState={setShowForardListingModal}/>
        <Invite2DashboardModal listing_id={currentListing._id} modalState={showMeetingRequestModal} setModalState={setShowMeetingRequestModal}/>
        <button className="btn btn-info" onClick={() => {setShowMeetingRequestModal(true)}} style={{fontSize: '0.7rem', height: '45px'}}>
          Invite to meeting
        </button>

        <button className="btn btn-info"  onClick={() => {setShowForardListingModal(true)}} style={{fontSize: '0.7rem', height: '45px'}}>
          Forward Dashboard
        </button>

        <button className="btn btn-info" onClick={showModal} style={{fontSize: '0.7rem', height: '45px'}}>
          Attach Listing
        </button>
      </div>
    );
  }

  return (
    <div>
      <div ref={parentRef} onClick={handleParentOnClick} id='tenantParentListing' style={{ position: 'sticky', top: '0', zIndex: '100', background: 'white'}}>
      <ListItem key={listing.requester._id}>
        <Grid container style={borderStyle}>
          <Grid item xs={4}>
            <div onSelect={handleSelect}>
              {listing.profile_pictures.map(picture => (
                 <a href={`/listing/tenant/${listing._id}/get`} key={listing._id} target="_blank">
                  <img
                    src={FILE_SERVER_URL+listing.profile_pictures[0].path}
                    alt={userName}
                    className="rounded-circle"
                    style={{
                            marginLeft: '20px',
                            width: '160px',
                            maxWidth: '100%',
                            maxHeight: '100%' }} />
                 </a>
              ))}
            </div>
          </Grid>
          <Grid item xs={8}>
            <Paper className="description" onClick={handleParentOnClick} style={{background: _backGroundColor}}>
              <div style={{ display:'flex', flexFlow: 'row', justifyContent: 'space-between', marginLeft: '5px'}}>
                <Typography className="description__address" color="textSecondary" style={{marginBottom: '10px', textAlign: "center"}}>
                  Summary of rental request
                </Typography>

                <section style={{color: 'rgb(165, 42, 42)'}} onClick={() => toggleCollapse()}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="24" height="24" focusable="false">
                    <path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z">
                    </path>
                  </svg>
                </section>
              </div>

                <Typography className="description__address" style={{fontSize: '.9rem'}}>
                  Move-in date:
                  {' '}
                  {moveInDate}
                </Typography>

                <Typography className="description__address" style={{fontSize: '.9rem'}}>
                  Location:
                  {' '}
                  {preferredLocation}
                </Typography>

              <div style={{ display: 'grid', gridTemplateColumns: "7fr 5fr"}}>
                <Typography className="description__address" style={{fontSize: '.9rem'}}>
                  Rental duration:
                  {' '}
                  {rentDuration}
                </Typography>
                <Typography className="description__address" style={{fontSize: '.9rem'}}>
                  Budget:
                  {' '}
                  {rentalBudget}
                  /m
                </Typography>
              </div>
              <Typography className="description__address" color="textSecondary" style={{marginTop: '10px', marginBottom: '5px', fontSize: '.9rem'}}>
                Posted by:
                {' '}
                {userName}
              </Typography>

              {DashboardControl()}

            </Paper>
          </Grid>
        </Grid>
      </ListItem>
      </div>

      <ChildListingsView
        handleSelect={handleSelect}
        listing={listing}
        removeHandler={removeChildListing}
        chattingContextType={chattingContextType}
        handleAttachListing={showModal}
      />
    </div>
  );
}

export default TenantListingComponent;
