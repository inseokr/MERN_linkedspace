import React, { useState } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';

function ListingComponent(props) {
  const [index, setIndex] = useState(0);
  const {listing} = props;
  const listingTitle = listing.rental_property_information.room_type + " " + listing.rental_property_information.unit_type;
  const listingAmenities = constructListingInformationBullets(listing.amenities);
  const listingAccessibleSpaces = constructListingInformationBullets(listing.accessible_spaces);

  const handleSelect = (e) => {
    setIndex(e);
  };

  return (
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
          </Paper>
        </Grid>
      </Grid>
    </ListItem>
  );
}

export default ListingComponent;
