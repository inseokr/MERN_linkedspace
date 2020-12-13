/* eslint-disable */
import React, { createContext, useState, useEffect } from 'react';
import { loadGoogleMapScript } from './helper/helper';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [listing_info, setListingInfo] = useState();
  const [currentListing, setCurrentListing] = useState();
  const [ListingInfoType, setListingInfoType] = useState('');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);

  function cleanupListingInfoType() {
    setListingInfoType('');
  }

  async function fetchListingInfo(_type) {
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

  useEffect(() => { // Initial useEffect to load google map.
    loadGoogleMapScript(() => {
      setMapLoaded(true);
    });
  }, []);

  return (
    <CurrentListingContext.Provider
      value={{
        mapLoaded,
        listing_info,
        currentListing,
        currentChildIndex,
        setCurrentChildIndex,
        fetchCurrentListing,
        fetchListingInfo,
        cleanupListingInfoType
      }}
    >
      {props.children}
    </CurrentListingContext.Provider>
  );
}
