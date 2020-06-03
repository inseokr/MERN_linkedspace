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
  const [places, setPlaces] = React.useState({Entire: true, Private: true, Shared: true});
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

  function getBoundsZoomLevel(bounds, mapDim) {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    function latRad(lat) {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const ne = bounds.northeast;
    const sw = bounds.southwest;

    const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

    const lngDiff = ne.lng - sw.lng;
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  }

  function isInsideBounds(coordinates, northeast, southwest) {
    const normalizeDegrees = v => v < 0 ? 360 + v % 360 : v % 360;
    return southwest.lat < coordinates.lat &&
      northeast.lat > coordinates.lat &&
      normalizeDegrees(coordinates.lng - southwest.lng) < normalizeDegrees(northeast.lng - southwest.lng)
  }

  function filterListingsBySearch(search) {
    changeSearch(search)
      .then(response => {
        if (document.getElementById('mapView')) { // Continue if element exists.
          const mapViewProperties = document.getElementById('mapView').getBoundingClientRect();
          filterListingsByBounds(response.viewport, response.location, getBoundsZoomLevel(response.viewport, {height: mapViewProperties.height, width: mapViewProperties.width}));
        } else {
          filterListingsByBounds(response.viewport, response.location, zoom);
        }
      });
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

  function filterListings(places, price, date) {
    let newFilteredListings = [];
    for (let listing of listingsByBounds) {
      if (places[listing.rental_property_information.room_type]) {
        let askingPrice = listing.rental_terms.asking_price;
        const min = price[0];
        const max = price[1];
        if ((askingPrice >= min && askingPrice <= max) || askingPrice > 1000) {
          newFilteredListings.push(listing);
        }
      }
    }
    setPlaces(places);
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
    filterListings(places, price, date);
  }, [listingsByBounds]);

  useEffect(() => {
    if (search.length > 0) {
      filterListingsBySearch(search);
    }
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
    <ListingsContext.Provider value={{mapLoaded, setSearch, filteredListings, filterListingsBySearch, filterListingsByBounds, filterListings, center, zoom, search, places, price, date}}>
      {props.children}
    </ListingsContext.Provider>
  );
}