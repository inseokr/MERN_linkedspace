import React, { createContext, useEffect, useRef, useState } from 'react';

export const ListingsContext = createContext();

const GOOGLE_MAP_API_KEY = 'API_KEY';

export function ListingsProvider(props) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingsByBounds, setListingsByBounds] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [center, setCenter] = useState({lat:37.338207, lng:-121.886330});
  const [zoom, setZoom] = useState(9);
  const [search, setSearch] = useState("");
  const [place, setPlace] = useState("");
  const [price, setPrice] = useState([1, 1000]);
  const [date, setDate] = useState("");

  async function changeSearch(search) {
    return getGeometryFromSearchString(search).then(
      response => {
        if (response.status === "OK") {
          setSearch(search);
          let geometry = response.results[0].geometry;
          console.log("getGeometryFromSearchString", response);
          return geometry
        }
      }
    );
  }

  async function getGeometryFromSearchString(search) {
    return await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + search + '&key=' + GOOGLE_MAP_API_KEY)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      });
  }

  function isInsideBounds(coordinates, northeast, southwest) {
    const normalizeDegrees = v => v < 0 ? 360 + v % 360 : v % 360;
    return southwest.lat < coordinates.lat &&
      northeast.lat > coordinates.lat &&
      normalizeDegrees(coordinates.lng - southwest.lng) < normalizeDegrees(northeast.lng - southwest.lng)
  }

  function filterListingsByBounds(bounds, center, zoom) {
    let newFilteredListings = [];
    for (let listing of listings) {
      if (isInsideBounds(listing.rental_property_information.coordinates, bounds.northeast, bounds.southwest)) {
        newFilteredListings.push(listing);
      }
    }
    setCenter(center);
    setZoom(zoom);
    setListingsByBounds(newFilteredListings);
  }

  function filterListings(place, price, date) {
    let newFilteredListings = [];
    for (let listing of listingsByBounds) {
      if (place === "" || listing.rental_property_information.room_type === place) {
        let askingPrice = listing.rental_terms.asking_price;
        const min = price[0];
        const max = price[1];
        if ((askingPrice >= min && askingPrice <= max) || askingPrice > 1000) {
          newFilteredListings.push(listing);
        }
      }
    }
    setPlace(place);
    setPrice(price);
    setDate(date);
    setFilteredListings(newFilteredListings);
  }

  async function getListInformation() {
    let listings = await fetch('/getData')
      .then(data => data.json())
      .then(listings => {
        console.log("getListInformation", listings);
        return listings;
      });
    for (let i=0; i<listings.length; i++) {
      let location = listings[i].rental_property_information.location;
      let address = listings[i].rental_property_information.location.street + ", " + location.city + ", " + location.state + ", " + location.zipcode + ", " + location.country;
      getGeometryFromSearchString(address).then(
        response => {
          let coordinates = response.results[0].geometry.location;
          listings[i].rental_property_information.address = address;
          listings[i].rental_property_information.coordinates = {"lat": coordinates.lat, "lng": coordinates.lng};
        }
      );
    }
    return listings;
  }

  function loadGoogleMapScript(callback) { // Load the google map script
    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
      callback();
    } else {
      const googleMapScript = document.createElement("script");
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}`;
      window.document.body.appendChild(googleMapScript);
      googleMapScript.addEventListener("load", callback);
    }
  }

  useEffect(() => {
    filterListings(place, price, date);
  }, [listingsByBounds]);

  useEffect(() => {
    const searchQuery = search.length > 0 ? search : "Fremont, CA, USA";
    changeSearch(searchQuery)
      .then(response => {
        console.log("useEffect by search", searchQuery, response);
        filterListingsByBounds(response.viewport, response.location, zoom);
      });
  }, [search]);

  useEffect(() => {
    loadGoogleMapScript(() => {
      setMapLoaded(true);
    });
    getListInformation()
      .then(response => {
        setListings(response);
      });
  }, []);

  return (
    <ListingsContext.Provider value={{mapLoaded, setSearch, filteredListings, filterListingsByBounds, filterListings, center, zoom, search, place, price, date}}>
      {props.children}
    </ListingsContext.Provider>
  );
}
