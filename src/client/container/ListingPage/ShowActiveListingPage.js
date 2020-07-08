import React, { Component, useEffect, createContext, useContext, useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox'
import {Link} from 'react-router-dom';
import '../../app.css';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

function getListingContents(listingDB, listing_prefix, type, listingControl) {
  let listings = [];

  function getCoverImg(listing_prefix, listing) {
    if(listing_prefix==="_3rdparty") {
      return (
        <a href={listing.url}>
          <img className="img-responsive center" style={{maxHeight:"80%", maxWidth:"100%", marginTop:"10px"}} src={listing.picture}/>
        </a>
      )
    } else {
      return (
        <Link to={"/listing/"+listing_prefix+"/"+listing.id+"/get"}>
          <img className="img-responsive center" style={{maxHeight:"80%", maxWidth:"100%", marginTop:"10px"}} src={listing.picture}/>
        </Link>
      )
    }
  }

  function getListingSourceInformation(listing_prefix, listing) {
    if(listing_prefix==="_3rdparty") {
      return (
        <span style={{textAlign: "center", color: "#332f2f"}}> <h6> {listing.source} </h6> </span>
      )
    } else {
      return null;
    }
  }

  function getListingControls(listing, type) {
    function handleOnClick(evt) {
      if(evt.target.checked===true) {
        listingControl.add(listing)
      } else {
        listingControl.remove(listing)
      }
    }

    if(type==="own") {
      return (
        <>
          <form role="form" action={"/listing/"+listing_prefix+"/"+listing.id+"/edit"} method="post">
            <div className="action">
              <button className="btn btn-info">Edit</button>
            </div>
          </form>

          <form role="form" action={"/listing/"+listing_prefix+"/"+listing.id+"?_method=DELETE"} method="post">
            <div className="action">
              <button className="btn btn-danger">Delete</button>
            </div>
          </form>
        </>
      )
    } else if(type==="child") {
      return (
        <div>
          <input type="checkbox" onClick={handleOnClick} value=""/>
          <label style={{marginLeft: "10px", color: "#6b2525"}}>Check to add</label>
        </div>
      )
    } else {
      // 1. listing creator
      // 2. date received
      let date = new Date(listing.timestamp);

      return (
        <div className='d-flex justify-content-around'>
          <span>From {listing.friend.username}</span>
          <span>{date.toDateString() + " " + date.toLocaleTimeString()} </span> 
        </div>
      )
    }
  }

  for (let index=0; index<listingDB.length; index++) {
    let listing =
      <div className="network_board" key={listingDB[index].id}>
        <div className="profile_picture">
          {getCoverImg(listing_prefix, listingDB[index], type)}
          {getListingSourceInformation(listing_prefix, listingDB[index])}
        </div>

        <div className="d-flex justify-content-between">
          {getListingControls(listingDB[index], type)}
        </div>
      </div>;

    listings.push(listing)
  }

  return listings;
}

function ShowActiveListingPage(props)
{
  console.log("ShowActiveListingPage");

  const {listing_info, fetchListingInfo} = useContext(CurrentListingContext);
  const [page_type, setPageType] = useState("own");

  // 1. own: show the listings created by the current users
  // 2. friend: show the listings forwarded from friends
  // 3. child: listing page used to add child listing
  if(page_type!=props.type) setPageType(props.type);

  // ISEO-TBD: fetching should be executed always?

  if(listing_info===undefined) {
    fetchListingInfo(page_type);
    return (<> No listing available </>);
  }

  // ISEO-TBD: not sure how to match it?
  let footer = "";

  let tenantListing =
    (props.type==="own" || props.type==="friend") ?
      <div className="bottom-shadow">
        <span style={{textAlign:"center"}}><h3> Room/House wanted  </h3></span>
        <hr/>
        <div className="d-flex justify-content-between flex-wrap">
          {getListingContents(listing_info.tenant_listing, "tenant", props.type)}
        </div>
      </div>
      : null;

  //useEffect(() => {
  //  fetchListingInfo(page_type);
  //});

  return (
    <>
      <div className="row">
        <div className="col-lg-3">
        </div>

        <div className="col-lg-6">
          <div className="bottom-shadow">
            <span style={{textAlign:"center"}}><h3> Listing from linkedspaces </h3></span>
            <hr/>
            <div className="d-flex justify-content-between flex-wrap">
              {getListingContents(listing_info.landlord_listing,
                "landlord", props.type,
                props.listingControl)}
            </div>
          </div>

          {tenantListing}

          <div className="bottom-shadow">
            <span style={{textAlign:"center"}}><h3> Listing from 3rd party  </h3></span>
            <hr/>
            <div className="d-flex justify-content-between flex-wrap">
              {getListingContents(listing_info._3rdparty_listing,
                "_3rdparty", props.type,
                props.listingControl)}
            </div>
          </div>
        </div>

        <div className="col-lg-3">
        </div>
      </div>
      {footer}
    </>
  );
}

export default ShowActiveListingPage
