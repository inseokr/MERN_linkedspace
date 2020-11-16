import React, { createContext, useEffect, useState } from 'react';

import {loadGoogleMapScript, getGeometryFromSearchString, createMarker, getBoundsZoomLevel, centerCoordinates, constructBounds, getLandLordRequests, updateListingsByBounds, updateListingsByFilters} from './helper/helper';

export const ListingsContext = createContext();

export function ListingsProvider(props) {
    const [mapElementID, setMapElementID] = useState("mapView");
    const [mapLoaded, setMapLoaded] = useState(false);

    const [listings, setListings] = useState([]);
    const [listingsByBounds, setListingsByBounds] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);

    const [mapParams, setMapParams] = useState({bounds: null, center: {lat:37.338207, lng:-121.886330}, zoom: 9});
    const [filterParams, setFilterParams] = useState({search: "", places: {Entire: true, Private: true, Shared: true}, price: [1, 1000], date: ""});

    // async function changeSearch(search) {
    //     return getGeometryFromSearchString(search).then(response => {
    //             if (response.status === "OK") {
    //                 setSearch(search);
    //                 let geometry = response.results[0].geometry;
    //                 console.log("getGeometryFromSearchString", response);
    //                 return geometry
    //             } else {
    //                 return {} // return an empty JSON if status is not OK
    //             }
    //         }
    //     );
    // }
    //
    // function filterListingsBySearch(search) {
    //     changeSearch(search).then(response => {
    //         if (Object.keys(response).length > 0) { // Continue if response is not empty.
    //             if (document.getElementById(mapElementID)) { // Continue if element exists.
    //                 const mapViewProperties = document.getElementById(mapElementID).getBoundingClientRect();
    //                 filterListingsByBounds(response.viewport, response.location, getBoundsZoomLevel(response.viewport, {height: mapViewProperties.height, width: mapViewProperties.width}));
    //             } else {
    //                 filterListingsByBounds(response.viewport, response.location, mapParams["zoom"]);
    //             }
    //         }
    //     });
    // }

    useEffect(() => { // Initial useEffect to load google map.
        loadGoogleMapScript(() => {
            setMapLoaded(true)
        });
    }, []);

    useEffect(() => { // If map is loaded get list of
        if (mapLoaded) {
            getLandLordRequests().then(response => {
                setListings(response);
                setFilteredListings(response) // Initially have same list as listings.
            });
        }
    }, [mapLoaded]);

    useEffect(() => {
        if (mapParams["bounds"]) {
            setFilteredListings(updateListingsByBounds(listings, mapParams["bounds"]));
        }
    }, [mapParams]);

    useEffect(() => {
        setFilteredListings(updateListingsByFilters(mapElementID, listings, filterParams, mapParams["zoom"]));
    }, [filterParams]);

    return (
        <ListingsContext.Provider value={{mapLoaded, createMarker, constructBounds, centerCoordinates, getGeometryFromSearchString, getBoundsZoomLevel, filteredListings, mapParams, setMapParams, filterParams, setFilterParams}}>
            {props.children}
        </ListingsContext.Provider>
    );
}
