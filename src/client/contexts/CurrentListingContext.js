import React, {createContext, useState} from "react";
import axios from 'axios';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
    const [listing_info, setListingInfo] = useState();
    const [currentListing, setCurrentListing] = useState();

    async function fetchListingInfo() {
      console.log("fetchListingInfo");

      fetch('/listing/get_active_listing')
        .then(res => res.json())
        .then(listing => {
            console.log("listing = " + JSON.stringify(listing));
            setListingInfo(listing)
          }
        )
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
        <CurrentListingContext.Provider value={{listing_info, currentListing, fetchCurrentListing, fetchListingInfo}}>
            {props.children}
        </CurrentListingContext.Provider>
    );
}
