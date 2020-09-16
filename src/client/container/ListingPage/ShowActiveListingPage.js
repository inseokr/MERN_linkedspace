import React, { useContext } from 'react';
import {Link} from 'react-router-dom';
import '../../app.css';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';
import GetRatingDeco from '../../components/decos/GetRatingDeco';

function checkChildListing(child_listings, id_) {
  if (child_listings.length===0) return false;

  for (let index=0; index< child_listings.length; index++) {
    if(child_listings[index].listing_id._id===id_) return true;
  }

  return false;
}

function getListingContents(listingDB, listing_prefix, type, child_listings, listingControl) {
  let listings = [];

  function getCoverImg(listing_prefix, listing) {
    if (listing_prefix==="_3rdparty") {
      return (
        <a href={listing.url} target="_blank">
          <img className="img-responsive center" style={{maxHeight:"80%", maxWidth:"100%", marginTop:"10px"}} src={listing.picture} alt="listingPicture"/>
        </a>
      )
    } else {
      return (
        <Link to={"/listing/"+listing_prefix+"/"+listing.id+"/get"}>
          <img className="img-responsive center" style={{maxHeight:"80%", maxWidth:"100%", marginTop:"10px"}} src={listing.picture} alt="listingPicture"/>
        </Link>
      )
    }
  }

  function getListingSourceInformation(listing_prefix, listing) {
    if (listing_prefix==="_3rdparty") {
      return (
        <span style={{textAlign: "center", color: "#332f2f"}}> <h6> {listing.source} </h6> </span>
      )
    } else {
      return null;
    }
  }

  function getListingControls(listing, type) {
    function handleOnClick(evt) {
      if (evt.target.checked===true) {
        listingControl.add(listing)
      } else {
        listingControl.remove(listing)
      }
    }

    if (type==="own") {
      let listing_url_type = (listing_prefix==="_3rdparty") ? "3rdparty": listing_prefix;
      return (
        <React.Fragment>
          <Link to={{pathname: "/3rdParty", listing_db: listing}}>
            <div className="action">
              <button className="btn btn-info">Edit</button>
            </div>
          </Link>

          <iframe name="hiddenFrame" class="hide"/>

          <form role="form" action={"/listing/"+listing_url_type+"/"+listing.id+"?_method=DELETE"} method="post" target="_blank">
            <div className="action">
              <button className="btn btn-danger">Delete</button>
            </div>
          </form>
        </React.Fragment>
      )
    } else if (type==="child") {
      return (
        <React.Fragment>
          <input type="checkbox" onClick={handleOnClick} value=""/>
          <label style={{marginLeft: "10px", color: "#6b2525"}}>Check to add</label>
        </React.Fragment>
      )
    } else {
      // 1. listing creator
      // 2. date received
      let date = new Date(listing.timestamp);

      if (listing.friend===undefined) {
        // update is in progress
        return (
          <div>
          </div>
        )
      } else {
        return (
          <div className='tenantListingSummary'>
            <div className='friendSummary'>
              <span className="panel-subtitle"> {listing.friend.friend_name} </span>
              <span className="socialDistance">
                {GetRatingDeco(1)}
              </span>
            </div>
            <span className="panel-subtitle"> {date.toDateString() + " " + date.toLocaleTimeString()} </span>
          </div>
        )
      }
    }
  }

  for (let index=0; index<listingDB.length; index++) {

    if (!checkChildListing(child_listings, listingDB[index].id)) {
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

      console.log("adding to listing");
      listings.push(listing)
    }
  }

  return listings;
}

function ShowActiveListingPage(props) {
  const {listing_info, currentListing} = useContext(CurrentListingContext);

  if(props.type==="child" && currentListing==undefined)
  {
    console.warn("No listing available");
    return <div> No listing available </div>;
  }

  let child_listings = (props.type==="child"? currentListing.child_listings: []);

  // 1. own: show the listings created by the current users
  // 2. friend: show the listings forwarded from friends
  // 3. child: listing page used to add child listing
  // ISEO-TBD: fetching should be executed always?
  if(listing_info===undefined) {
    return (<div> No listing available </div>);
  }

  // ISEO-TBD: not sure how to match it?
  let footer = "";

  let tenantListing =
    (props.type==="own" || props.type==="friend") ?
      <div className="bottom-shadow">
        <span style={{textAlign:"center"}}><h3> Room/House wanted  </h3></span>
        <hr/>
        <div className="d-flex justify-content-between flex-wrap">
          {getListingContents(listing_info.tenant_listing, "tenant", props.type, child_listings)}
        </div>
      </div>
      : null;

  return (
    <div>
      <div className="row">
        <div className="col-lg-3">
        </div>

        <div className="col-lg-6">
          <div className="bottom-shadow">
            <span style={{textAlign:"center"}}><h3> Listing from linkedspaces </h3></span>
            <hr/>
            <div className="d-flex justify-content-between flex-wrap">
              {getListingContents(listing_info.landlord_listing,
                "landlord", props.type, child_listings,
                props.listingControl)}
            </div>
          </div>

          {tenantListing}

          <div className="bottom-shadow">
            <span style={{textAlign:"center"}}><h3> Listing from 3rd party  </h3></span>
            <hr/>
            <div className="d-flex justify-content-between flex-wrap">
              {getListingContents(listing_info._3rdparty_listing,
                "_3rdparty", props.type, child_listings,
                props.listingControl)}
            </div>
          </div>
        </div>

        <div className="col-lg-3">
        </div>
      </div>
      {footer}
    </div>
  );
}

export default ShowActiveListingPage
