/* eslint-disable */
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
  const [listing_info, setListingInfo] = useState();
  const [currentListing, setCurrentListing] = useState();
  const [ListingInfoType, setListingInfoType] = useState('');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);

  function cleanupListingInfoType() {
    setListingInfoType('');
  }

  async function fetchListingInfo(_type) {
    // console.log("ISEO: fetchListingInfo: _type =" + _type);
    // console.log("ISEO: ListingInfoType =" + ListingInfoType);

    if (ListingInfoType !== _type) {
      setListingInfoType(_type);
      // type
      // + own: created by the user
      // + friend: forwarded from other users
      // console.log("get_active_listing: type = " + _type);

      if (_type === 'child') _type = 'own';

      fetch(`/LS_API/listing/get_active_listing/${_type}`)
        .then(res => res.json())
        .then((listing) => {
          // console.log("listing = " + JSON.stringify(listing));
          setListingInfo(listing);
        });
    }
  }

  useEffect(() => {
  }, [currentChildIndex]);

  async function fetchCurrentListing(id, listing_type) {
    console.log(`fetchCurrentListing is called with listing_id = ${id}, type = ${listing_type}`);
    const _prefix = (listing_type === 'landlord') ? '/listing/landlord/' : '/listing/tenant/';

    let successful = 0;

    await fetch(`/LS_API/${_prefix + id}/fetch`)
      .then(res => res.json())
      .then((listing) => {
        console.log(`listing = ${JSON.stringify(listing)}`);
        setCurrentListing(listing);
        successful = 1;
      });

    return successful;
  }

  return (
    <CurrentListingContext.Provider value={{
      listing_info, currentListing, fetchCurrentListing, fetchListingInfo, cleanupListingInfoType, currentChildIndex, setCurrentChildIndex
    }}
    >
      {props.children}
    </CurrentListingContext.Provider>
  );
}
