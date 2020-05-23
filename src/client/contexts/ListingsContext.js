import React, { createContext, useEffect, useRef, useState } from 'react';

export const ListingsContext = createContext();

const GOOGLE_MAP_API_KEY = 'AIzaSyDfAArJl_Tr9w-KFszZQoLfyXUdFZzy9zs';

export function ListingsProvider(props) {
  const googleMapRef = useRef();
  let googleMap = null;

  const [mapLoaded, setMapLoaded] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingsByBounds, setListingsByBounds] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [center, setCenter] = useState({lat:37.338207, lng:-121.886330});
  const [zoom, setZoom] = useState(9);
  const [search, setSearch] = useState("Fremont, CA, USA");
  const [place, setPlace] = useState("");
  const [price, setPrice] = useState([1, 1000]);
  const [date, setDate] = useState("");

  async function changeSearch(search) {
    getGeometryFromSearchString(search).then(
      response => {
        if (response.status === "OK") {
          setSearch(search);
          let geometry = response.results[0].geometry;
          console.log("TESTSTSTS", geometry);
          // let bounds = new window.google.maps.LatLngBounds();
          // console.log("getGeometryFromSearchString", bounds);
          // filterListingsByBounds(geometry.viewport, geometry.location, zoom);
        }
      }
    );
  }

  function filterListingsByBounds(bounds, center, zoom) {
    let filteredListings = [];
    for (let listing of listings) {
      if (bounds.contains(listing.rental_property_information.coordinates)) {
        filteredListings.push(listing);
      }
    }
    setCenter(center);
    setZoom(zoom);
    setListingsByBounds(filteredListings);
    filterListings(place, price, date);
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

  async function getGeometryFromSearchString(search) {
    return await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + search + '&key=' + GOOGLE_MAP_API_KEY)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      });
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
    loadGoogleMapScript(() => {
      setMapLoaded(true);
      console.log("test", googleMapRef, zoom, center, mapLoaded);
      // googleMap = new window.google.maps.Map(googleMapRef.current, {zoom: zoom, center: center});
      // console.log("GSDFGWERFWED", googleMap.getBounds());
    });
  }, [mapLoaded]);

  useEffect(() => {
    getListInformation()
      .then(response => {
        setListings(response);
        setListingsByBounds(response);
        setFilteredListings(response);
      });
  }, []);

  return (
    <ListingsContext.Provider value={{googleMapRef, mapLoaded, changeSearch, filteredListings, filterListingsByBounds, filterListings, center, zoom, search, place, price, date}}>
      {props.children}
    </ListingsContext.Provider>
  );
}
