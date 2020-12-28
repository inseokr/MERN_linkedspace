/* eslint-disable */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GlobalContext } from './GlobalContext';
import { getGeometryFromSearchString, loadGoogleMapScript } from './helper/helper';
import { filter } from 'async';


export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
  const [mapElementID, setMapElementID] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [listing_info, setListingInfo] = useState();
  const [currentListing, setCurrentListing] = useState();
  const [ListingInfoType, setListingInfoType] = useState('');
  const [currentChildIndex, setCurrentChildIndex] = useState(-1);
  const [childListingId2ChildIndexMap, setChildListingId2ChildIndexMap] = useState([]);
  const [parentRef, setParentRef] = useState(null);

  const [mapParams, setMapParams] = useState({
    bounds: null,
    center: { lat: 37.338207, lng: -121.886330 },
    zoom: 9
  });

  const [filterParams, setFilterParams] = useState({
    search: '',
    places: { Entire: true, Private: true, Shared: true },
    price: [1, 1000],
    date: ''
  });

  const {currentUser} = useContext(GlobalContext);

  function getCurrentUser()
  {
    return currentUser;
  }

  function cleanupListingInfoType() {
    setListingInfoType('');
  }

  function focusParentListing() {

    if(parentRef!==null && parentRef.current !==undefined && parentRef.current !== null)
    {
      //console.log("Focusing Parent Listing");
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

    if(currentListing===undefined || currentListing.child_listings===undefined)
    {
      console.warn("buildChildListingMappingTable: child listing it not available??");
      return;
    }
    //console.log(`currentListing = ${currentListing}`);
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

    //console.warn(`setChildIndexByChannelId: setCurrentChildIndex=${currentChildIndex}, new index = ${_childIndex}`);

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

  useEffect(() => { // Update center when search is updated.
    const { search } = filterParams;
    if (search.length > 0) {
      updateCenter(search);
    }
  }, [filterParams]);

  useEffect(() => { // Initial useEffect to load google map.
    loadGoogleMapScript(() => {
      setMapLoaded(true);
    });
  }, [mapElementID]);


  useEffect(() => {
    buildChildListingMappingTable();
    // <note> how to trigger loadChattingDatabase from here?
  }, [currentListing]);


  function updateCenter(address) {
    getGeometryFromSearchString(address).then(response => {
      const { results, status} = response;
      if (status === "OK") {
        const geometry = results[0].geometry;
        const { location } = geometry;
        setMapParams({ ...mapParams, center: location });
      }
    });
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

        const { location } = listing;
        if (location) {
          const { city, state, zipcode } = location;
          const address = `${city}, ${state}, ${zipcode}`;
          setFilterParams({ ...filterParams, search: address });
          updateCenter(address);
        }

        // build mapping table between child listing ID and child index
        //buildChildListingMappingTable();
      });

    return successful;
  }

  return (
    <CurrentListingContext.Provider value={{
      mapElementID,
      setMapElementID,
      mapLoaded,
      listing_info,
      currentListing,
      fetchCurrentListing,
      fetchListingInfo,
      cleanupListingInfoType,
      currentChildIndex,
      setCurrentChildIndex,
      getChildIndexByListingId,
      setChildIndexByChannelId,
      setParentRef,
      parentRef,
      focusParentListing,
      getCurrentUser,
      mapParams,
      setMapParams,
      filterParams,
      setFilterParams
    }}
    >
      {props.children}
    </CurrentListingContext.Provider>
  );
}
