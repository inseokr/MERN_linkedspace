import React, { useState, useContext } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import ShowActiveListingPage from "../../../ListingPage/ShowActiveListingPage";
import ChildListingsView from "./ChildListingsView";
import {GlobalContext} from "../../../../contexts/GlobalContext";
import axios from 'axios';
import $ from 'jquery';


function TenantListingComponent(props) {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const {currentUser} = useContext(GlobalContext);
  const {listing, toggle, mode} = props;

  const userName          = listing.requester.username;
  const moveInDate        = listing.move_in_date.month + "/" + listing.move_in_date.date + "/" + listing.move_in_date.year;
  const rentDuration      = listing.rental_duration + "month(s)"
  const rentalBudget      = "$"+ listing.rental_budget 
  const preferredLocation = listing.location.city + "," + listing.location.state + "," + listing.location.country;

  //ISEO-TBD: It's just for testing purpose
  const [ChildListings, setChildListings] = useState([]);

  async function addChildListing(childListing)
  {
    console.log("addChildListing");
    let tempListings = [...ChildListings]
    tempListings.push(childListing)
    setChildListings(tempListings);
    console.log("addChildListing, len="+tempListings.length);

    // post to DB as well
    // 1. Need ID of current active listing
    var data = {parent_listing_id: listing._id,
                child_listing_id:  childListing._id,
                username: currentUser.username,
                listing_type: "_3rdparty"
                };

    const result = await axios.post('/listing/tenant/addChild', data)
    .then(result => {
      console.log("addChildListing result = " + result);
    })
    .catch(err => console.log(err));
  }

  async function removeChildListing(childListing)
  {
    let tempListings = ChildListings.filter(function(item) {
      return (item.id!==childListing.id)
    })
    
    setChildListings(tempListings);
    console.log("removeChildListing, len="+tempListings.length);
    
    // post to DB as well
    var data = {parent_listing_id: listing._id,
                child_listing_id:  childListing._id,
                listing_type: "_3rdparty"};

    const result = await axios.post('/listing/tenant/removeChild', data)
    .then(result => {
      console.log("removeChildListing result = " + result);
    })
    .catch(err => console.log(err));

  }

  let showModal = () => {
    setModalShow(true);
  }

  let handleClose = () => {
    setModalShow(false);
  }

  const handleSelect = (e) => {
    setIndex(e);
  };

  let listingControl = {add: addChildListing, remove: removeChildListing}


  function addChildListingControl()
  {
    return (
      <div className="flex-container" style={{justifyContent: "space-between"}}>
        {/* ISEO-TBD:  Let's add messaging icon */}
        <MessageEditorIcon clickHandler={toggle}/>

        <SimpleModal show={modalShow} handleClose={handleClose} captionCloseButton="Add selected listings">
          <ShowActiveListingPage type="pick listing" listingControl={listingControl}/> 
        </SimpleModal>
        <button className="btn btn-info" onClick={showModal}>
          Add Listing
        </button>
      </div>
    )
  }

  return (
    <>
    <div> 
    <ListItem>
      <Grid container>
        <Grid item xs={4}>
          <Carousel interval={null} slide={true} activeIndex={index} onSelect={handleSelect} className={"carousel"}>
            {listing.profile_pictures.map(function (picture) {
              return (
                <Carousel.Item>
                  <img src={picture.path} alt={userName} className={"carouselImage rounded-circle"} style={{maxWidth:"90%"}}/>
                </Carousel.Item>
              )
            })}
          </Carousel>
        </Grid>
        <Grid item xs={8}>
          <Paper className={"description"}>
            <Typography className={"description__address"} color={"textSecondary"} gutterBottom>
              Pereferred location: {preferredLocation}
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
                User name: {userName}
              </Typography>
              <Typography className={"description__address"} color={"textSecondary"}>
                email: {listing.email}
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
                         childListings = {ChildListings}
                         removeHandler = {removeChildListing}/>
    </div>

    </>
  );
}

export default TenantListingComponent;
