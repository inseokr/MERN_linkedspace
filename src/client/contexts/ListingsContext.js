import React, { createContext, useEffect, useState } from 'react';
import {
  loadGoogleMapScript, getLandLordRequests, updateListingsByBounds, updateListingsByFilters
} from './helper/helper';

export const ListingsContext = createContext();

export function ListingsProvider(props) {
  const { children } = props;

  const [mapElementID, setMapElementID] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingsByFilter, setListingsByFilter] = useState([]);
  const [listingsByBounds, setListingsByBounds] = useState([]);

  const [mapParams, setMapParams] = useState({
    bounds: null,
    center: { lat: 37.338207, lng: -121.886330 },
    zoom: 9
  });

  const [filterParams, setFilterParams] = useState({
    search: 'Fremont, CA, USA',
    places: { Entire: true, Private: true, Shared: true },
    price: [1, 1000],
    date: ''
  });

  useEffect(() => { // Initial useEffect to load google map.
    loadGoogleMapScript(() => {
      setMapLoaded(true);
    });
  }, [mapElementID]);

  useEffect(() => { // If map is loaded get list of
    if (mapLoaded) {
      getLandLordRequests().then((response) => {
        setListings(response);
        setListingsByFilter(response); // Initially have same list as listings.
      });
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (mapParams.bounds) {
      setListingsByBounds(updateListingsByBounds(listingsByFilter, mapParams.bounds));
    }
  }, [listingsByFilter, mapParams]);

  useEffect(() => {
    async function filterListings() {
      return updateListingsByFilters(mapElementID, listings, filterParams);
    }
    filterListings().then((response) => {
      if (response) {
        const [updatedFilteredListings, boundParams] = response;
        setListingsByFilter(updatedFilteredListings);
        setMapParams(boundParams);
      }
    });
  }, [mapElementID, filterParams]);

  return (
    <ListingsContext.Provider
      value={{
        setMapElementID,
        mapLoaded,
        listingsByBounds,
        mapParams,
        setMapParams,
        filterParams,
        setFilterParams
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}
