/* eslint-disable */
import React, { useState, useContext } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel';
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import ShowActiveListingPageWrapper from '../../../ListingPage/ShowActiveListingPageWrapper';

import { GlobalContext } from '../../../../contexts/GlobalContext';
import {FILE_SERVER_URL} from '../../../../globalConstants';

function ListingComponent(props) {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const { friendsList, currentUser } = useContext(GlobalContext);
  const { listing, toggle } = props;
  const listingTitle = `${listing.rental_property_information.room_type} ${listing.rental_property_information.unit_type}`;
  const listingAmenities = constructListingInformationBullets(listing.amenities);
  const listingAccessibleSpaces = constructListingInformationBullets(listing.accessible_spaces);

  // ISEO-TBD: It's just for testing purpose
  const [ChildListings, setChildListings] = useState([]);

  function addChildListing(listing) {
    console.log('addChildListing');
    const tempListings = [...ChildListings];
    tempListings.push(listing);
    setChildListings(tempListings);
    console.log(`addChildListing, len=${tempListings.length}`);
  }

  function removeChildListing(listing) {
    const tempListings = ChildListings.filter(item => (item.id !== listing.id));

    setChildListings(tempListings);
    console.log(`removeChildListing, len=${tempListings.length}`);
  }

  const showModal = () => {
    setModalShow(true);
  };

  const hideModal = () => {
    setModalShow(false);
  };

  const handleSelect = (e) => {
    setIndex(e);
  };

  const handleParentOnClock = (e) => {
    // alert("handleParentOnClock clicked");
  };

  const listingControl = { add: addChildListing, remove: removeChildListing };


  function addChildListingControl(childSupported) {
    if (childSupported) {
      return (
        <div className="flex-container" style={{ justifyContent: 'space-between' }}>
          {/* ISEO-TBD:  Let's add messaging icon */}
          <MessageEditorIcon clickHandler={toggle} callerType="parent" parent_listing={listing} />

          <SimpleModal show={modalShow} handleClose={hideModal}>
            <ShowActiveListingPageWrapper type="child" listingControl={listingControl} />
          </SimpleModal>
          <button className="btn btn-info" onClick={showModal}>
            Add Listing
          </button>
        </div>
      );
    }
    return <div />;
  }

  function getConnectedFriends() {
    console.log(`Length of direct friends = ${currentUser.direct_friends.length}`);
    if (currentUser.direct_friends.length > 0) {
      const profile_picture = (currentUser.direct_friends[0] === undefined) ? '' : currentUser.direct_friends[0].profile_picture;

      return (
        <div className="flex-container" style={{ justifyContent: 'flex-start' }}>
          <img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+profile_picture} alt={currentUser.direct_friends[0].username} style={{ maxHeight: '70%', height: '60px' }} />
          <Typography style={{ marginTop: '10px', marginLeft: '5px' }}> connected friends </Typography>
        </div>
      );
    }

    return <React.Fragment> </React.Fragment>;
  }

  return (
    <div>
      <div>
        <ListItem>
          <Grid container>
            <Grid item xs={4}>
              <Carousel interval={null} slide activeIndex={index} onSelect={handleSelect} className="carousel">
                {listing.pictures.map(picture => (
                  <Carousel.Item key={picture.path}>
                    <img src={FILE_SERVER_URL+picture.path} alt={picture.caption} className="carouselImage" />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Grid>
            <Grid item xs={8}>
              <Paper className="description" onClick={handleParentOnClock}>
                <Typography className="description__summary" color="textSecondary">
                  LinkedSpaces
                </Typography>

                <Typography className="description__title" style={{ marginTop: '5px' }} gutterBottom>
                  {listingTitle}
                </Typography>
                <Typography className="description__address">
                  {listing.rental_property_information.address}
                </Typography>
                {listingAmenities.length > 0 ? (
                  <Typography className="description__bullets" gutterBottom>
                    {listingAmenities}
                  </Typography>
                ) : (<div />)}
                {listingAccessibleSpaces.length > 0 ? (
                  <Typography className="description__bullets" gutterBottom>
                    {listingAccessibleSpaces}
                  </Typography>
                ) : (<div />)}
                <div className="flex-container" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
                  <div className="flex-container" style={{ justifyContent: 'flex-start' }}>
                    <img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+listing.requester.profile_picture} alt="Hosted By" style={{ maxHeight: '70%', height: '60px' }} />
                    <Typography style={{ marginTop: '10px', marginLeft: '5px' }}>
                      {' '}
                      Hosted by
                      {listing.requester.username}
                    </Typography>
                  </div>
                  {getConnectedFriends()}
                </div>
              </Paper>
            </Grid>
          </Grid>
        </ListItem>
      </div>

    </div>
  );
}

export default ListingComponent;
