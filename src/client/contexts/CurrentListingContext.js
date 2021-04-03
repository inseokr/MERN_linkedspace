/* eslint-disable */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GlobalContext } from './GlobalContext';
import { getGeometryFromSearchString, loadGoogleMapScript } from './helper/helper';
import { filter } from 'async';
import sampleProfile from '../assets/images/Chinh - Vy.jpg';

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
    price: [1, 10000],
    date: ''
  });

  const [markerParams, setMarkerParams] = useState({
    refresh: false,
    selectedMarkerID: null,
    markers: []
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
  }

  function getChildListingUrl(index=-1) {
    let _childIndex = (index===-1)? currentChildIndex: index;

    try {
      if(currentListing!==undefined && currentListing.child_listings[_childIndex])
      {
        let _childListing = currentListing.child_listings[_childIndex].listing_id;

        if(_childListing.listingType==='_3rdparty') {
          return _childListing.listingUrl;
        }
        else {
          return `/listing/landlord/${_childListing._id}/get`;
        }
      }
      else
      {
        return ''
      }
    } catch(err) {
      console.warn(err);
      return ''
    }
  }

  function buildChildListingMappingTable() {
    let _tempMap = [];

    if(currentListing===undefined || currentListing.child_listings===undefined)
    {
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
        if(currentListing.child_listings[index].listing_id!==null) {
         _tempMap[currentListing.child_listings[index].listing_id._id] = index;
        }
      }
    }
    setChildListingId2ChildIndexMap(_tempMap);
  }

  function getChildIndexByListingId(_listingId)
  {
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

  function setChildIndexByListingId(_listingId)
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
    const _prefix = (listing_type === 'landlord') ? '/listing/landlord/' : '/listing/tenant/';

    let successful = 0;

    if(currentListing!==undefined && currentListing._id!=id) {
      //console.warn(`new listing is being loaded`);
      setCurrentChildIndex(-1);
      focusParentListing();
    }

    await fetch(`/LS_API/${_prefix + id}/fetch`)
      .then(res => res.json())
      .then((listing) => {
        if (listing !== null) {
          console.log(`listing_type = ${listing_type}`);
          console.log(listing);

          setCurrentListing(listing);
          successful = 1;

          if (listing_type === "landlord") {
            const { listing: listingDetails } = listing;
            if (listingDetails) {
              const { rental_property_information } = listingDetails;
              if (rental_property_information) {
                const { coordinates } = rental_property_information;
                if (coordinates) {
                  setMapParams({ ...mapParams, center: coordinates });
                }
              }
            }
          } else if (listing_type === "tenant") {
            const { coordinates } = listing;
            if (coordinates) {
              setMapParams({ ...mapParams, center: coordinates });
            }
          }
        }
      });

    return successful;
  }


  function getProfilePictureFromSharedGroup(user_name) {
    if (user_name === undefined || currentUser === null) return sampleProfile;

    if (user_name === currentUser.username) {
      return currentUser.profile_picture;
    }

    let userList = currentListing.shared_user_group;

    if(userList===undefined) return sampleProfile;

    if(userList.length===0) return sampleProfile;

    for(let index=0; index<userList.length; index++)
    {
      if(userList[index].username===user_name) return userList[index].profile_picture;
    }

    console.warn("getProfilePictureFromSharedGroup: no user found with given user name = " + user_name);
    return sampleProfile;

  }

  function registeredInSharedGroup(user_name) {
    if (user_name === undefined || currentUser === null) return false;

    if (user_name === currentUser.username) {
      return true;
    }

    let userList = currentListing.shared_user_group;

    if(userList.length===0) return false;

    for(let index=0; index<userList.length; index++)
    {
      if(userList[index].username===user_name) return true;
    }

    return false;
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
      setChildIndexByListingId,
      setParentRef,
      parentRef,
      focusParentListing,
      getCurrentUser,
      mapParams,
      setMapParams,
      filterParams,
      setFilterParams,
      markerParams,
      setMarkerParams,
      getProfilePictureFromSharedGroup,
      getChildListingUrl,
      registeredInSharedGroup,
    }}
    >
      {props.children}
    </CurrentListingContext.Provider>
  );
}
