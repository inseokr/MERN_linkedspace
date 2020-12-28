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
import { GlobalContext } from '../../../../contexts/GlobalContext';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import { FILE_SERVER_URL } from '../../../../globalConstants';
import axios from 'axios';

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
  clickState, likedState, clickHandler, likeClickHandler, handleSelect, listing, index, messageClickHandler, removeHandler
}, ref) => {
  // const [modalShow, setModalShow] = useState(false);
  const {
    setChattingContextType,
    setChildType, childType,
    setChildIndex, childIndex,
    loadChattingDatabase
  } = useContext(MessageContext);
  const { setCurrentChildIndex, currentListing, currentChildIndex } 	= useContext(CurrentListingContext);
  const { getProfilePicture } = useContext(GlobalContext);
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
    e.stopPropagation();
    // e.preventDefault();
    clickHandler(index);

    setCurrentChildIndex(index);

    // update the message context
    updateMessageContext();
  }

  async function _likeClickHandler(e) {
    e.stopPropagation();
    //alert(e.currentTarget.id);
    //likeClickHandler(index);
    likeClickHandler(e.currentTarget.id);
  }

  function removeListingHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    
    removeHandler(childListing);
  }

  const scrollToBottom = () => {
  // console.log("scrollToBottom. numOfMsgHistory="+numOfMsgHistory);
    if (reference.current !== undefined && reference.current != null) {
      reference.current.scrollIntoView({ block: 'end', inline: 'nearest' });
    }
  };

  function triggerScroll() {
    // ISEO-TBD: It's very interesting bug, but I should re-schedule the scrollToBottom with some delay.
    // I assume it's happening because React is doing things in parallel and the scroll operation is made
    // while the data is still being loaded.
    setTimeout(() => {
    scrollToBottom();
    }, 100);
  }    

  useEffect(() => {
    if (reference != null) {
      console.log(`ChildListing: useEffect: ref.current=${reference.current}`);
      if (clicked == 1) {
        console.log('clicking from useEffect');
        // reference.current.click();
        triggerScroll();
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

  function getListOfLikedFriends() {
    if(index==-1 || currentListing.child_listings[index]===undefined) return "";

    let _childListing = currentListing.child_listings[index];

    function checkIfInLikedList(user_id)
    {
      for(let user_index=0; user_index< _childListing.listOfLikedUser.length; user_index++)
      {
        if(_childListing.listOfLikedUser[user_index]===user_id)
        {
          return true;
        }  
      }
      return false;
    }

    let listOfFriendsImage = [];

    // go through the list of liked friends
    // get the profile picture by user ID
    // <note> share_user_group does have the profile picture
    _childListing.shared_user_group.forEach((user, _index) => {
      if(checkIfInLikedList(user._id)===true)
      {
        listOfFriendsImage.push(<img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+getProfilePicture(user.username)} alt="Liked friend"  />);
      }
    });


    return (
      <div className="listOfLikedFriends">
        {listOfFriendsImage}
      </div>
    );
  }

  let _backGroundColor = (clickState==1)? "#b0becc": "none";
  let heartStyle = (likedState===1)? "fa-heart": "fa-heart-o";

  return (
    <ListItem>
      <Grid container className="childListing" ref={reference} onClick={listingClickHandler} style={borderStyle}>
        <Grid item xs={4}>
          <Carousel interval={null} slide activeIndex={0} onSelect={handleSelect} className="carousel">
            <Carousel.Item>
              {linkToListing}
            </Carousel.Item>
          </Carousel>
          <div className="likedListing d-flex flex-row">
            <button class="btn btn-less-margin" id={`${index}`} onClick={_likeClickHandler}>
              <i className={`fa ${heartStyle} heartColor`} aria-hidden="true"></i>
            </button>
            {getListOfLikedFriends()}
          </div>
        </Grid>

        <Grid item xs={8}>
          <Paper className="description flex-container" style={{ flexDirection: 'column', justifyContent: 'space-between', background: _backGroundColor}}>
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
