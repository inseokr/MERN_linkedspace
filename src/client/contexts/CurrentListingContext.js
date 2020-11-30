import React, { createContext, useState, useEffect } from "react";

export const CurrentListingContext = createContext();

export function CurrentListingProvider(props) {
    const [listing_info, setListingInfo] = useState();
    const [currentListing, setCurrentListing] = useState({});
    const [listingInfoType, setListingInfoType] = useState("");
    const [currentChildIndex, setCurrentChildIndex] = useState(0);

    function fetchListingInfo(_type) {
        const listingType = _type === "child" ? "child" : "own";
        if (listingInfoType !== listingType) {
            setListingInfoType(listingType);
            fetch('/listing/get_active_listing/'+_type).then(response => response.json())
                .then(listing => {
                    setListingInfo(listing)
                });
        }
    }

    function fetchCurrentListing(id, listingType) {
        console.log(`fetchCurrentListing called with listing_id: ${id}, type: ${listingType}`);

        return fetch(`/listing/${listingType}/${id}/fetch`).then(response => response.json())
            .then(listing => {
                console.log(`listing: ${JSON.stringify(listing)}`);
                setCurrentListing(listing);
                return true
            }).catch(() => {
                return false
            });
    }

    return (
        <CurrentListingContext.Provider value={{listing_info, currentListing, fetchCurrentListing, fetchListingInfo, setListingInfoType, currentChildIndex, setCurrentChildIndex}}>
            {props.children}
        </CurrentListingContext.Provider>
    );
}
