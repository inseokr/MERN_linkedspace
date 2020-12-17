/* eslint-disable */
import React, { useEffect, useContext } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';
import $ from 'jquery';

function FavoriteDashboard(props) {

  const {currentUser} = useContext(GlobalContext);

  function getLastVisitedListingId() {

    console.log("getLastVisitedListingId: before JQuery");

    $.get("https://sfbay.craigslist.org/eby/apa/d/oakland-nice-view-bay-bridge-bedrooms/7247926599.html", 
      function(response) { 
        console.log("received response = " + response);
        alert(response) 
      });

    // This should be called only once when no current user is set
    //console.log("getLastVisitedListingId");
    fetch('/LS_API/listing/getLastVisitedListingId')
      .then(res => res.json())
      .then((listingId) => {
        if(listingId!==null)
        {
          //console.log(` Last Visited Listing ID = ${listingId}`);
          props.history.push(`/listing/tenant/${listingId}/dashboard`);
        }
      });
  }

  getLastVisitedListingId();

  return (
    <div>
      No visting history of dashboard
    </div>
  );
}

export default FavoriteDashboard;
