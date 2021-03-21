/* eslint-disable */
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel';
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import SimpleModal from '../../../../components/Modal/SimpleModal';
import { MessageContext, MSG_CHANNEL_TYPE_LISTING_CHILD } from '../../../../contexts/MessageContext';
import { GlobalContext } from '../../../../contexts/GlobalContext';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import { FILE_SERVER_URL } from '../../../../globalConstants';
import axios from 'axios';

function getChildListingSummary(childListing) {

  if(childListing===null) return null;

  if (childListing.listingType === '_3rdparty') {
    return {
      id: childListing._id,
      listingType: childListing.listingType,
      location: (childListing.location===undefined )? "": childListing.location.city,
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
    listingSummary: `${childListing.summary_of_listing.slice(0, 100)}...`
  };
}

const ChildListing = React.forwardRef(({
  clickState, likedState, clickHandler, likeClickHandler, handleSelect, listing, index, removeHandler
}, ref) => {
  // const [modalShow, setModalShow] = useState(false);
  const {
    setChattingContextType,
    setChildType, childType,
    setChildIndex, childIndex,
    loadChattingDatabase,
    checkAnyUnreadMessages,
    toggleCollapse
  } = useContext(MessageContext);

  const [modalShow, setModalShow] = useState(false);

  const { setCurrentChildIndex, currentListing, filterParams, markerParams, setMarkerParams, getProfilePictureFromSharedGroup } 	= useContext(CurrentListingContext);
  const { getProfilePicture, currentUser } = useContext(GlobalContext);
  const [clicked, setClicked] = useState(0);
  const [reference, setReference] = useState(null);

  const listingTitle = (listing.listing_type === '_3rdPartyListing') ? listing.listing_id.listingSource : 'LinkedSpaces';

  const childListing = listing.listing_id;
  const childListingSummary = getChildListingSummary(childListing);

  if(childListingSummary===null) return <React.Fragment> </React.Fragment>

  const borderStyle = (listing._id === markerParams.selectedMarkerID) ? {
    borderLeftStyle: 'solid',
    borderLeftColor: (checkAnyUnreadMessages(MSG_CHANNEL_TYPE_LISTING_CHILD, index) === true)? 'red': '#115399',
    borderLeftWidth: '5px'
  } : (checkAnyUnreadMessages(MSG_CHANNEL_TYPE_LISTING_CHILD, index) === true)? {
    borderLeftStyle: 'solid',
    borderLeftColor: 'red',
    borderLeftWidth: '5px'
  } : {};

  if (clicked !== clickState) {
    console.log('ChildListing: click state changed');
    setClicked(clickState);
  }

  if (ref !== reference) {
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
    setChildType((listing.listing_type === '_3rdPartyListing') ? 0 : 1);

    setChildIndex(index);
  }

  function listingClickHandler(e) {
    e.stopPropagation();
    // e.preventDefault();
    clickHandler(index);
    console.log('listingClickHandler', listing);
    setMarkerParams({ ...markerParams, selectedMarkerID: listing._id});
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
    setModalShow(false);
  }

  function handleRemoveButton(e) {
    e.preventDefault();
    e.stopPropagation();

    setModalShow(true);
  }

  function handleCancel(e) {
    e.preventDefault();
    e.stopPropagation();

    setModalShow(false);
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
      if (clicked === 1) {
        console.log('clicking from useEffect');
        // reference.current.click();
        triggerScroll();
      }
    } else console.log('ref is null');
  }, [clicked, reference]);

  const linkToListing = (childListingSummary.listingType === '_3rdparty')
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
    if(index===-1 || currentListing.child_listings[index]===undefined) return "";

    let _childListing = currentListing.child_listings[index];

    function checkIfInLikedList(user_id)
    {
      if (Object.keys(_childListing).includes("listOfLikedUser")) {
        for(let user_index=0; user_index< _childListing.listOfLikedUser.length; user_index++)
        {
          if(_childListing.listOfLikedUser[user_index]===user_id)
          {
            return true;
          }
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
        listOfFriendsImage.push(<img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+getProfilePictureFromSharedGroup(user.username)} alt="Liked friend"  />);
      }
    });


    return (
      <div className="listOfLikedFriends">
        {listOfFriendsImage}
      </div>
    );
  }

  let _backGroundColor = (listing._id === markerParams.selectedMarkerID)? "#b0becc": "none";
  let heartStyle = (likedState===1)? "fa-heart": "fa-heart-o";

  const { price } = filterParams;
  const min = price[0];
  const max = price[1];
  const rentalPrice = (childListing.listingType==="landlord")? Number(childListing.rental_terms.asking_price): childListing.rentalPrice;
  if ((rentalPrice >= min && rentalPrice <= max) || max === 10000) {
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
              <button className="btn btn-less-margin" id={`${index}`} onClick={_likeClickHandler}>
                <i className={`fa ${heartStyle} heartColor`} aria-hidden="true"/>
              </button>
              {getListOfLikedFriends()}
            </div>
          </Grid>

          <Grid item xs={8}>
            <div className="flex-container" style={{ flexDirection: 'column', justifyContent: 'space-between', background: _backGroundColor}}> 
              <div style={{ display:'flex', flexFlow: 'row', justifyContent: 'space-between', marginLeft: '5px'}}>
                <Typography className="description__title" color="textSecondary" gutterBottom style={{fontSize: '.9rem', marginLeft: '5px', color: '#652143'}}>
                  {listingTitle}
                </Typography>
                <section style={{color: 'rgb(165, 42, 42)'}} onClick={toggleCollapse}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="24" height="24" focusable="false">
                    <path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z">
                    </path>
                  </svg>
                </section>
              </div>

              <Typography className="description__summary" style={{fontSize: '.9rem', marginLeft: '5px'}}>
                {childListingSummary.listingSummary}
              </Typography>
              <div style={{ display:'flex', flexFlow: 'row', justifyContent: 'space-between', marginLeft: '5px'}}>
                <Typography style={{fontSize: '.9rem'}}>
                  {' '}
                  Price: $
                  {childListingSummary.rentalPrice}
                </Typography>
                <Typography style={{fontSize: '.9rem', marginRight: '10px'}}>
                  {' '}
                  City:
                  {childListingSummary.location}
                </Typography>
              </div>

              <div className="flex-container" style={{ justifyContent: 'space-between', marginTop: '10px'}}>
                <div className="flex-container" style={{ justifyContent: 'flex-start' }}>
                  <img className="img-responsive center rounded-circle" src={FILE_SERVER_URL+childListing.requester.profile_picture} alt="Hosted By" style={{ maxHeight: '70%', height: '60px' }} />
                  <Typography style={{ marginTop: '10px', marginLeft: '5px' , fontSize: '.9rem'}}>
                    {' '}
                    Shared by
                    {' '}
                    {childListing.requester.username}
                  </Typography>
                </div>
                 <SimpleModal show={modalShow} handle1={removeListingHandler} caption1="Yes" handle2={handleCancel} caption2="No" styles={{width: '20%', height: 'auto', overflowY: 'hidden'}}>
                    <div style={{textAlign: "center", marginTop: "10px", marginBottom: "10px", fontSize: "120%", color: "#981407"}}> Are you sure to remove this listing?</div>
                </SimpleModal>
                {(childListing.requester.username===currentUser.username) &&
                <button className="btn btn-danger" onClick={handleRemoveButton} style={{fontSize: '.9rem', height: '45px'}}>
                  Remove
                </button>
                }
              </div>
            </div>
          </Grid>
        </Grid>
      </ListItem>
    );
  } else {
    return (<></>);
  }
});

export default ChildListing;
