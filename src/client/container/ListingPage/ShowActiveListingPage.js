/* eslint-disable */
import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import '../../app.css';
import {FILE_SERVER_URL} from '../../globalConstants';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import GetRatingDeco from '../../components/decos/GetRatingDeco';
import '../../container/ListingPage/common/file_upload.css';
import AddItem from '../../components/CustomControls/AddItem';

function ShowActiveListingPage(props) {
  const { listing_info, currentListing } = useContext(CurrentListingContext);
  const { currentUser } = useContext(GlobalContext);
  const history = useHistory();

  let modal = (props.modal===undefined)? 'false': props.modal;

  async function loadCreateListingPage(evt, listingType) {
    if(listingType==='_3rdparty')
    {
      evt.preventDefault();
      history.push('/3rdParty');
    }
  }
  
  function checkChildListing(child_listings, id_) {
    if (child_listings.length === 0) return false;
  
    for (let index = 0; index < child_listings.length; index++) {
      if (child_listings[index].listing_id !==null && child_listings[index].listing_id._id === id_) return true;
    }
  
    return false;
  }
  
  function checkIfListingRead(user, listing_type, id_) {
    const listingArray = (listing_type==='tenant')? user.incoming_tenant_listing: user.incoming_landlord_listing;
  
    for(let index=0; index<listingArray.length; index++)
    {
      if(listingArray[index].id===id_)
      {
        if(listingArray[index].status==="Read")
        {
          return true;
        } 
      }
    }
    return false;
  }
  
  function getListingContents(currentUser, listingDB, listing_prefix, type, child_listings, listingControl) {
    const listings = [];
  
    function getCoverImg(listing_prefix, listing) {
      if (listing_prefix === '_3rdparty') {
        return (
          <a href={listing.url} target="_blank">
            <img className="img-responsive center" style={{ maxHeight: '80%', height: 'max-content', maxWidth: '100%', marginTop: '10px' }} src={FILE_SERVER_URL+listing.picture} alt="listingPicture" />
          </a>
        );
      }
      return (
        <Link to={`/listing/${listing_prefix}/${listing.id}/get`}>
          <img className="img-responsive center" style={{ maxHeight: '80%', height: 'max-content',  maxWidth: '100%', marginTop: '10px' }} src={FILE_SERVER_URL+listing.picture} alt="listingPicture" />
        </Link>
      );
    }
  
    function getListingSourceInformation(listing_prefix, listing) {
      if (listing_prefix === '_3rdparty') {
        return (
          <span style={{ textAlign: 'center', color: '#332f2f' }}>
            {' '}
            <h6>
              {' '}
              {listing.source}
              {' '}
            </h6>
            {' '}
          </span>
        );
      }
      return null;
    }
  
    function getListingControls(listing, type) {
      function handleOnClick(evt) {
        if (evt.target.checked === true) {
          listingControl.add(listing);
        } else {
          listingControl.remove(listing);
        }
      }
  
      if (type === 'own') {
        const listing_url_type = (listing_prefix === '_3rdparty') ? '3rdparty' : listing_prefix;
        const editForm = (listing_prefix === '_3rdparty') ? 
            <Link to={{ pathname: '/3rdParty', listing_db: listing }}>
              <div className="action">
                <button className="btn btn-info">Edit</button>
              </div>
            </Link> :
            <form role="form" action={`/LS_API/listing/${listing_url_type}/${listing.id}/edit`} method="post" target="_blank">
              <div className="action">
                <button className="btn btn-info">Edit</button>
              </div>
            </form>
        return (
          <React.Fragment>
            {editForm}
            <iframe name="hiddenFrame" className="hide" />
  
            <form role="form" action={`/LS_API/listing/${listing_url_type}/${listing.id}?_method=DELETE`} method="post" target="_blank">
              <div className="action">
                <button className="btn btn-danger">Delete</button>
              </div>
            </form>
          </React.Fragment>
        );
      } if (type === 'child') {
        return (
          <div style={{display: "table-cell", verticalAlign: "middle"}}>
            <input type="checkbox" onClick={handleOnClick} value="" />
            <label style={{ marginLeft: '10px', color: '#6b2525', fontSize: '0.8rem' }}>Click checkbox to add</label>
          </div>
        );
      }
      // 1. listing creator
      // 2. date received
      const date = new Date(listing.timestamp);
  
      if (listing.friend === undefined) {
        // update is in progress
        return (
          <div />
        );
      }
      return (
        <div className="tenantListingSummary">
          <div className="friendSummary">
            <span className="panel-subtitle">
              {' '}
              {listing.friend.friend_name}
              {' '}
            </span>
            <span className="socialDistance">
              {GetRatingDeco(1)}
            </span>
          </div>
          <span className="panel-subtitle">
            {' '}
            {date.toDateString()}
            {' '}
          </span>
        </div>
      );
    }
  
    for (let index = 0; index < listingDB.length; index++) {
      const additionalClasses = 
        ((type==="friend") && (checkIfListingRead(currentUser, listing_prefix, listingDB[index].id)===false))? 'bottom_highlight': "";
  
      if (!checkChildListing(child_listings, listingDB[index].id)) {
        const listing = (
          <div className={`network_board ${additionalClasses}`} key={listingDB[index].id}>
            <div className="profile_picture">
              {getCoverImg(listing_prefix, listingDB[index], type)}
              {getListingSourceInformation(listing_prefix, listingDB[index])}
            </div>
  
            <div className="d-flex justify-content-center">
              {getListingControls(listingDB[index], type)}
            </div>
          </div>
        );
  
        console.log('adding to listing');
        listings.push(listing);
      }
    }
  
    if(type=="own") {
      const addListingTile = 
        <div className='network_board'>
          <AddItem onClickHander={loadCreateListingPage} listingType={listing_prefix}/>
        </div>
  
      listings.push(addListingTile);
    }
  
    return listings;
  }

  if (props.type === 'child' && currentListing == undefined) {
    console.warn('No listing available');
    return <div> No listing available </div>;
  }

  const child_listings = (props.type === 'child' ? currentListing.child_listings : []);

  // 1. own: show the listings created by the current users
  // 2. friend: show the listings forwarded from friends
  // 3. child: listing page used to add child listing
  // ISEO-TBD: fetching should be executed always?
  if (listing_info === undefined) {
    return (<div> No listing available </div>);
  }

  // ISEO-TBD: not sure how to match it?
  const footer = '';

  const tenantListing = (props.type === 'own' || props.type === 'friend')
    ? (
      <div className="bottom-shadow">
        <span style={{ textAlign: 'center' }}><h3> Room/House wanted  </h3></span>
        <hr />
        <div className="d-flex justify-content-between flex-wrap">
          {getListingContents(currentUser, listing_info.tenant_listing, 'tenant', props.type, child_listings)}
        </div>
      </div>
    )
    : null;

  let mainClassName = (modal==='true')? 'col-lg-12': 'col-lg-6';

  const _titleHousing = {"own": "Housing inventory - LinkedSpaces", "friend": "Looking for tenant(s)", "child": "Housing inventory - LinkedSpaces"};

  return (
    <div>
      <div className="row">
        {(modal==='false') && <div className="col-lg-3" />}
        <div className={mainClassName}>
          {(props.type === 'own' || props.type === 'friend') && tenantListing}
          {(props.type === 'own' || props.type === 'child') &&
          <div className="bottom-shadow" style={{marginTop: '20px'}}>
            <span style={{ textAlign: 'center' }}><h3> Housing inventory - 3rd party  </h3></span>
            <hr />
            <div className="d-flex justify-content-between flex-wrap">
              {getListingContents(currentUser, listing_info._3rdparty_listing,
                '_3rdparty', props.type, child_listings,
                props.listingControl)}
            </div>
          </div>}
          <div className="bottom-shadow" style={{marginTop: '20px'}}>
            <span style={{ textAlign: 'center' }}><h3> {_titleHousing[props.type]} </h3></span>
            <hr />
            <div className="d-flex justify-content-between flex-wrap">
              {getListingContents(currentUser, listing_info.landlord_listing,
                'landlord', props.type, child_listings,
                props.listingControl)}
            </div>
          </div>        
        </div>
        {(modal==='false') && <div className="col-lg-3" />}
      </div>
      {footer}
    </div>
  );
}

export default ShowActiveListingPage;
