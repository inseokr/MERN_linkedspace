/* eslint-disable */
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel';
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import { MessageContext } from '../../../../contexts/MessageContext';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import { FILE_SERVER_URL } from '../../../../globalConstants';

function getChildListingSummary(childListing) {
  console.log(`getChildListingSummary, listingType = ${childListing.listingType}`);

  if (childListing.listingType == '_3rdparty') {
    return {
      id: childListing._id,
      listingType: childListing.listingType,
      location: childListing.location.city,
      listingUrl: childListing.listingUrl,
      coverPhoto: childListing.coverPhoto.path,
      rentalPrice: childListing.rentalPrice,
      listingSummary: childListing.listingSummary
    };
  }

  return {
    id: childListing._id,
    listingType: childListing.listingType,
    location: childListing.rental_property_information.location.city,
    listingUrl: 'TBD',
    coverPhoto: childListing.pictures[0].path,
    rentalPrice: childListing.rental_terms.asking_price,
    listingSummary: `${childListing.summary_of_listing.slice(0, 20)}...`
  };
}

const ChildListing = React.forwardRef(({
  clickState, clickHandler, handleSelect, listing, index, messageClickHandler, removeHandler
}, ref) => {
  // const [modalShow, setModalShow] = useState(false);
  const {
    setChattingContextType,
    setChildType, childType,
    setChildIndex, childIndex,
    loadChattingDatabase
  } = useContext(MessageContext);
  const { setCurrentChildIndex } 	= useContext(CurrentListingContext);
  const [clicked, setClicked] = useState(0);
  const [reference, setReference] = useState(null);

  const listingTitle = (listing.listing_type == '_3rdPartyListing') ? listing.listing_id.listingSource : 'LinkedSpaces';

  const childListing = listing.listing_id;
  const childListingSummary = getChildListingSummary(childListing);

  const borderStyle = (clickState == 1) ? {
    borderLeftStyle: 'solid',
    borderLeftColor: '#115399',
    borderLeftWidth: '5px'
  } : {};

  if (clicked != clickState) {
    console.log('ChildListing: click state changed');
    setClicked(clickState);
  }

  if (ref != reference) {
    console.log('setReference is called');
    setReference(ref);
  }

  function updateMessageContext() {
    setChattingContextType(2);

    // ISEO-TBD: dang...the following call will trigger the reload of MessageEditor
    // and all the state will be gone when it's reloaded??
    // need to know the type of listing
    // ISEO-TBD: It's another bad example... let's use constanct instead.
    // what if the DB model name got changed??
    setChildType((listing.listing_type == '_3rdPartyListing') ? 0 : 1);

    setChildIndex(index);
    messageClickHandler(true);
  }

  function listingClickHandler(e) {
    // e.preventDefault();
    clickHandler(index);

    setCurrentChildIndex(index);

    // update the message context
    updateMessageContext();
  }

  function removeListingHandler(e) {
    e.preventDefault();
    removeHandler(childListing);
  }

  useEffect(() => {
    if (reference != null) {
      console.log(`ChildListing: useEffect: ref.current=${reference.current}`);
      if (clicked == 1) {
        console.log('clicking from useEffect');
        // reference.current.click();
      }
    } else console.log('ref is null');
  }, [clicked, reference]);

  const linkToListing = (childListingSummary.listingType == '_3rdparty')
    ? (
      <a href={childListingSummary.listingUrl} target="_blank">
        <img src={FILE_SERVER_URL+childListingSummary.coverPhoto} alt="Listing Picture" className="carouselImage" />
      </a>
    )
    : (
      <Link to={`/listing/landlord/${childListingSummary.id}/get`} target="_blank">
        <img src={FILE_SERVER_URL+childListingSummary.coverPhoto} alt="Listing Picture" className="carouselImage" />
      </Link>
    );
  return (
    <ListItem>
      <Grid container className="childListing" ref={reference} onClick={listingClickHandler} style={borderStyle}>
        <Grid item xs={4}>
          <Carousel interval={null} slide activeIndex={0} onSelect={handleSelect} className="carousel">
            <Carousel.Item>
              {linkToListing}
            </Carousel.Item>
          </Carousel>
        </Grid>

        <Grid item xs={8}>
          <Paper className="description flex-container" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography className="description__title" color="textSecondary" gutterBottom>
              {listingTitle}
            </Typography>
            <Typography className="description__summary">
              {childListingSummary.listingSummary}
            </Typography>
            <Typography>
              {' '}
              Price: $
              {childListingSummary.rentalPrice}
            </Typography>
            <Typography>
              {' '}
              City:
              {childListingSummary.location}
            </Typography>
            <div className="flex-container" style={{ justifyContent: 'space-between', marginTop: '40px' }}>
              <div className="flex-container" style={{ justifyContent: 'flex-start' }}>
                <img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+childListing.requester.profile_picture} alt="Hosted By" style={{ maxHeight: '70%', height: '60px' }} />
                <Typography style={{ marginTop: '10px', marginLeft: '5px' }}>
                  {' '}
                  Hosted by 
                  {' '}
                  {childListing.requester.username}
                </Typography>
              </div>
              <button className="btn btn-danger" onClick={removeListingHandler}>
                Remove
              </button>
            </div>

          </Paper>
        </Grid>
      </Grid>
    </ListItem>
  );
});

export default ChildListing;
