import React, {createContext, useState} from "react";
import axios from 'axios';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
    const [listing_info, setListingInfo] = useState();
    const [currentListing, setCurrentListing] = useState();
    const [ListingInfoType, setListingInfoType] = useState("");


    function cleanupListingInfoType()
    {
      setListingInfoType("");
    }

    async function fetchListingInfo(_type) {

      if(ListingInfoType!=_type)
      {
        setListingInfoType(_type);
        // type
        // + own: created by the user
        // + friend: forwarded from other users
        fetch('/listing/get_active_listing/'+_type)
          .then(res => res.json())
          .then(listing => {
              console.log("listing = " + JSON.stringify(listing));
              setListingInfo(listing)
            }
          )
      }
    }


  async function fetchCurrentListing(id, listing_type) {
    console.log("fetchCurrentListing is called with listing_id = " + id + ", type = " + listing_type);
    let _prefix = (listing_type==="landlord") ? "/listing/landlord/" : "/listing/tenant/";

    const result = await fetch(_prefix+id+'/fetch')
      .then(res => res.json())
      .then(listing => {
          console.log("listing = " + JSON.stringify(listing));
          setCurrentListing(listing);
          return 1;
        }
      )

    return 0;
  }

    return (
        <CurrentListingContext.Provider value={{listing_info, currentListing, fetchCurrentListing, fetchListingInfo, cleanupListingInfoType}}>
            {props.children}
        </CurrentListingContext.Provider>
    );
}
