import React, { useState, useContext } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import ShowActiveListingPageWrapper from "../../../ListingPage/ShowActiveListingPageWrapper";
import ChildListingsView from "./ChildListingsView";
import {GlobalContext} from "../../../../contexts/GlobalContext";
import {MessageContext, MSG_CHANNEL_TYPE_LISTING_PARENT} from "../../../../contexts/MessageContext";
import {CurrentListingContext} from '../../../../contexts/CurrentListingContext';
import axios from 'axios';
import $ from 'jquery';


function TenantListingComponent(props) {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const {currentUser} = useContext(GlobalContext);
  const {currentListing, setCurrentListing, fetchCurrentListing} = useContext(CurrentListingContext);
  const {setChattingContextType, chattingContextType} = useContext(MessageContext);
  const {listing, toggle, mode} = props;

  const userName          = listing.requester.username;
  const moveInDate        = listing.move_in_date.month + "/" + listing.move_in_date.date + "/" + listing.move_in_date.year;
  const rentDuration      = listing.rental_duration + "month(s)";
  const rentalBudget      = "$"+ listing.rental_budget;
  const preferredLocation = listing.location.city + "," + listing.location.state + "," + listing.location.country;


  let borderStyle = (chattingContextType==MSG_CHANNEL_TYPE_LISTING_PARENT)? {
    borderLeftStyle: "solid",
    borderLeftColor: "#115399",
    borderLeftWidth: "5px"
  } : {}


  async function addChildListing(childListing) {
    console.log("addChildListing");

    // 1. Need ID of current active listing
    var data = {parent_listing_id: listing._id,
                child_listing_id:  childListing.id,
                username: currentUser.username,
                listing_type: "_3rdparty"
                };

    const result = await axios.post('/listing/tenant/addChild', data)
    .then(result => {
      console.log("addChildListing result = " + result);
      fetchCurrentListing(currentListing._id, "tenant");
    })
    .catch(err => console.log(err));
  }

  async function removeChildListing(childListing) {

    // post to DB as well
    var data = {parent_listing_id: listing._id,
                child_listing_id:  childListing._id,
                listing_type: "_3rdparty"};

    const result = await axios.post('/listing/tenant/removeChild', data)
    .then(result => {
      console.log("removeChildListing result = " + result);
      fetchCurrentListing(currentListing._id, "tenant");
    })
    .catch(err => console.log(err));

  }

  let showModal = () => {
    setModalShow(true);
  };

  let handleClose = () => {
    setModalShow(false);
  };

  const handleSelect = (e) => {
    setIndex(e);
  };

  const handleParentOnClock = (e) => {
    if(chattingContextType!=MSG_CHANNEL_TYPE_LISTING_PARENT)
    {
      setChattingContextType(MSG_CHANNEL_TYPE_LISTING_PARENT);
    }
    // need to reload the message window... 
    toggle(true);
  };

  let listingControl = {add: addChildListing, remove: removeChildListing};


  function addChildListingControl() {
    return (
      <div className="flex-container" style={{justifyContent: "flex-end"}}>
        <SimpleModal show={modalShow} handleClose={handleClose} captionCloseButton="Add selected listings">
          <ShowActiveListingPageWrapper type="child" listingControl={listingControl}/>
        </SimpleModal>
        <button className="btn btn-info" onClick={showModal}>
          Add Listing
        </button>
      </div>
    )
  }

  return (
    <div>
    <ListItem key={listing.requester.id}>
      <Grid container style={borderStyle}>
        <Grid item xs={4}>
          <Carousel interval={null} slide={true} activeIndex={index} onSelect={handleSelect} className={"carousel"}>
            {listing.profile_pictures.map(function (picture) {
              return (
                <Carousel.Item key={picture._id}>
                  <img src={picture.path} alt={userName} className={"carouselImage rounded-circle"} style={{maxWidth:"90%"}}/>
                </Carousel.Item>
              )
            })}
          </Carousel>
        </Grid>
        <Grid item xs={8}>
          <Paper className={"description"} onClick={handleParentOnClock} >
            <Typography className={"description__address"} color={"textSecondary"} gutterBottom>
              Preferred location: {preferredLocation}
            </Typography>
            <Typography className={"description__address"}>
              Move-in date: {moveInDate}
            </Typography>
            <Typography className={"description__address"}>
              Rental duration: {rentDuration}
            </Typography>
            <Typography className={"description__address"}>
              Budget: {rentalBudget} per month
            </Typography>

            <div className="flex-container" style={{justifyContent: "space-between"}}>
              <Typography className={"description__address"} color={"textSecondary"}>
                Username: {userName}
              </Typography>
              <Typography className={"description__address"} color={"textSecondary"}>
                Email: {listing.email}
              </Typography>
            </div>

            <Typography className={"description__address"} color={"textSecondary"}>
              phone: {listing.phone}
            </Typography>

            {addChildListingControl()}

          </Paper>
        </Grid>
      </Grid>
    </ListItem>
      <ChildListingsView handleSelect={handleSelect}
                         messageClickHandler={toggle}
                         listing={listing}
                         removeHandler = {removeChildListing}/>
    </div>
  );
}

export default TenantListingComponent;
