import React, {createContext, useState} from "react";
import axios from 'axios';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
    const [listing_info, setListingInfo] = useState();
    const [currentListing, setCurrentListing] = useState();

    async function fetchListingInfo()
    {
        console.log("fetchListingInfo")

	    fetch('/listing/get_active_listing')
	  	.then(res => res.json())
	  	.then(listing => {
	  		console.log("listing = " + JSON.stringify(listing));
	      	setListingInfo(listing)
			}
	  	)
    }


    async function fetchCurrentListing(id)
    {
        console.log("fetchCurrentListing is called with listing_id = " + id);
        
        fetch('/listing/landlord/'+id+'/fetch')
        .then(res => res.json())
        .then(listing => {
            console.log("listing = " + JSON.stringify(listing));
            setCurrentListing(listing)
            }
        )
    }

    return (
        <CurrentListingContext.Provider value={{ listing_info, currentListing, fetchCurrentListing, fetchListingInfo}}>
            {props.children}
        </CurrentListingContext.Provider>
    );
}