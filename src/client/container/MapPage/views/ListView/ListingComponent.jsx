import React, { useState } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import ShowActiveListingPageWrapper from "../../../ListingPage/ShowActiveListingPageWrapper"


function ListingComponent(props) {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const {listing, toggle, mode} = props;
  const listingTitle = listing.rental_property_information.room_type + " " + listing.rental_property_information.unit_type;
  const listingAmenities = constructListingInformationBullets(listing.amenities);
  const listingAccessibleSpaces = constructListingInformationBullets(listing.accessible_spaces);

  //ISEO-TBD: It's just for testing purpose
  const [ChildListings, setChildListings] = useState([]);

  function addChildListing(listing) {
    console.log("addChildListing");
    let tempListings = [...ChildListings];
    tempListings.push(listing);
    setChildListings(tempListings);
    console.log("addChildListing, len="+tempListings.length);
  }

  function removeChildListing(listing) {
    let tempListings = ChildListings.filter(function(item) {
      return (item.id!==listing.id)
    });

    setChildListings(tempListings);
    console.log("removeChildListing, len="+tempListings.length);
  }

  let showModal = () => {
    setModalShow(true);
  };

  let hideModal = () => {
    setModalShow(false);
  };

  const handleSelect = (e) => {
    setIndex(e);
  };

  let listingControl = {add: addChildListing, remove: removeChildListing}


  function addChildListingControl(childSupported) {
    if(childSupported) {
      return (
        <div className="flex-container" style={{justifyContent: "space-between"}}>
          {/* ISEO-TBD:  Let's add messaging icon */}
          <MessageEditorIcon clickHandler={toggle} callerType="parent" parent_listing={listing}/>

          <SimpleModal show={modalShow} handleClose={hideModal}>
            <ShowActiveListingPageWrapper type="child" listingControl={listingControl}/>
          </SimpleModal>
          <button className="btn btn-info" onClick={showModal}>
            Add Listing
          </button>
        </div>
      )
    } else {
      return <div></div>;
    }
  }

  return (
    <div>
    <div>
    <ListItem>
      <Grid container>
        <Grid item xs={4}>
          <Carousel interval={null} slide={true} activeIndex={index} onSelect={handleSelect} className={"carousel"}>
            {listing.pictures.map(function (picture) {
              return (
                <Carousel.Item>
                  <img src={picture.path} alt={picture.caption} className={"carouselImage"}/>
                </Carousel.Item>
              )
            })}
          </Carousel>
        </Grid>
        <Grid item xs={8}>
          <Paper className={"description"}>
            <Typography className={"description__title"} color={"textSecondary"} gutterBottom>
              {listingTitle}
            </Typography>
            <Typography className={"description__address"}>
              {listing.rental_property_information.address}
            </Typography>
            {listingAmenities.length > 0 ? (
              <Typography className={"description__bullets"} color={"textSecondary"} gutterBottom>
                {listingAmenities}
              </Typography>
            ) : (<div></div>)}
            {listingAccessibleSpaces.length > 0 ? (
              <Typography className={"description__bullets"} color={"textSecondary"} gutterBottom>
                {listingAccessibleSpaces}
              </Typography>
            ) : (<div></div>)}
            {addChildListingControl(props.childSupported)}
          </Paper>
        </Grid>
      </Grid>
    </ListItem>
    </div>

    </div>
  );
}

export default ListingComponent;
