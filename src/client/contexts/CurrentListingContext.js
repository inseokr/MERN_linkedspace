import React, {createContext, useState} from "react";
import axios from 'axios';

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
    const [listing_info, setCurrentListing] = useState();


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
        <CurrentListingContext.Provider value={{ listing_info, setCurrentListing, fetchCurrentListing }}>
            {props.children}
        </CurrentListingContext.Provider>
    );
}