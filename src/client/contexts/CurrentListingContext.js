/* eslint-disable */
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
  const [listing_info, setListingInfo] = useState();
  const [currentListing, setCurrentListing] = useState();
  const [ListingInfoType, setListingInfoType] = useState('');
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [childListingId2ChildIndexMap, setChildListingId2ChildIndexMap] = useState([]);
  const [parentRef, setParentRef] = useState(null);

  function cleanupListingInfoType() {
    setListingInfoType('');
  }

  function focusParentListing() {

    if(parentRef!==null && parentRef.current !==undefined && parentRef.current !== null)
    {
      console.log("Focusing Parent Listing");
      parentRef.current.click();
      parentRef.current.scrollIntoView();
    }
    else
    {
      console.warn("focusParentListing failure");
    }
  }


  function buildChildListingMappingTable() {
    let _tempMap = [];

    if(currentListing===undefined) return;
    
    for(let index=0; index< currentListing.child_listings.length; index++)
    {
      if(currentListing.child_listings[index].listing_id===undefined)
      {
        console.warn("listing ID is undefined for index = " + index);
      }
      else
      {
        _tempMap[currentListing.child_listings[index].listing_id._id] = index;
      }
    }
    setChildListingId2ChildIndexMap(_tempMap);
  }

  function getChildIndexByListingId(_listingId)
  {
    //console.log("getChildIndexByListingId = " + childListingId2ChildIndexMap[_listingId]);

    if(childListingId2ChildIndexMap[_listingId]!==null && childListingId2ChildIndexMap[_listingId]!==undefined)
    {
      //console.log("getChildIndexByListingId: return index = " + childListingId2ChildIndexMap[_listingId]);
      return (childListingId2ChildIndexMap[_listingId]);
    }
    else
    {
      console.warn("No child listing available");
      return 0;
    }
  }

  function setChildIndexByChannelId(_listingId)
  {
    let _childIndex = getChildIndexByListingId(_listingId);

    setCurrentChildIndex(_childIndex);
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

        // build mapping table between child listing ID and child index
        buildChildListingMappingTable();
      });

    return successful;
  }

  return (
    <CurrentListingContext.Provider value={{
      listing_info, currentListing, fetchCurrentListing, fetchListingInfo, 
      cleanupListingInfoType, currentChildIndex, setCurrentChildIndex,
      getChildIndexByListingId,setChildIndexByChannelId, 
      setParentRef, parentRef,
      focusParentListing
    }}
    >
      {props.children}
    </CurrentListingContext.Provider>
  );
}
