import React, { useState } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import ShowActiveListingPage from "../../../ListingPage/ShowActiveListingPage"


function ListingComponent(props) {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const {listing, toggle, mode} = props;
  const listingTitle = listing.rental_property_information.room_type + " " + listing.rental_property_information.unit_type;
  const listingAmenities = constructListingInformationBullets(listing.amenities);
  const listingAccessibleSpaces = constructListingInformationBullets(listing.accessible_spaces);

  let showModal = () => {
    setModalShow(true);
  }

  let hideModal = () => {
    setModalShow(false);
  }

  const handleSelect = (e) => {
    setIndex(e);
  };

  let collapsibleComponent = (mode=="Map") ? <div> <h1> Please collapse me </h1> </div> : null

  return (
    <>
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
            ) : (<></>)}
            {listingAccessibleSpaces.length > 0 ? (
              <Typography className={"description__bullets"} color={"textSecondary"} gutterBottom>
                {listingAccessibleSpaces}
              </Typography>
            ) : (<></>)}

            {/* ISEO-TBD:  Let's add messaging icon */}
            <MessageEditorIcon clickHandler={toggle}/>
          </Paper>
        </Grid>
      </Grid>
      </ListItem>
      {collapsibleComponent}
    </div>
  
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
            ) : (<></>)}
            {listingAccessibleSpaces.length > 0 ? (
              <Typography className={"description__bullets"} color={"textSecondary"} gutterBottom>
                {listingAccessibleSpaces}
              </Typography>
            ) : (<></>)}

              <div className="flex-container" style={{justifyContent: "space-between"}}>
                {/* ISEO-TBD:  Let's add messaging icon */}
                <MessageEditorIcon clickHandler={toggle}/>

                <SimpleModal show={modalShow} handleClose={hideModal}>
                  <ShowActiveListingPage type="pick listing"/> 
                </SimpleModal>
                <button className="btn btn-info" onClick={showModal}>
                  Add Listing
                </button>
              </div>

          </Paper>
        </Grid>
      </Grid>
    </ListItem>

    </>
  );
}

export default ListingComponent;
