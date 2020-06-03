import React, { useContext, useEffect, useRef, useState } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import createHTMLMapMarker from './createHTMLMapMarker';
import './Map.css';

function Map() {
  const {filteredListings, filterListingsByBounds, center, zoom} = useContext(ListingsContext);
  const googleMapRef = useRef(null);
  let googleMap = null;

  useEffect(() => {
    console.log("useEffect", center, zoom, filteredListings);
    googleMap = initGoogleMap();

    googleMap.addListener('dragend', function () {
      const idleListener = googleMap.addListener('idle', function () {
        google.maps.event.removeListener(idleListener);
        filterListingsByBounds(constructBounds(googleMap.getBounds()), centerCoordinates(googleMap.getCenter()), zoom);
      });
    });

    googleMap.addListener('zoom_changed', function () {
      const idleListener = googleMap.addListener('idle', function () {
        google.maps.event.removeListener(idleListener);
        filterListingsByBounds(constructBounds(googleMap.getBounds()), centerCoordinates(googleMap.getCenter()), googleMap.getZoom());
      });
    });

    if (filteredListings.length > 0) {
      let bounds = new window.google.maps.LatLngBounds();
      filteredListings.map(listing => {
        const coordinates = listing.rental_property_information.coordinates;
        const marker = createMarker(coordinates);
        marker.addListener("click", () => {
          alert("Clicked!");
        });
        bounds.extend(coordinates);
      });
    }
  }, [filteredListings]);

  const initGoogleMap = () => { // Initialize the google map
    return new window.google.maps.Map(googleMapRef.current, {zoom: zoom, center: center});
  };

  const createMarker = (coordinates) => {
    const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    return createHTMLMapMarker({
      latlng: latLng,
      map: googleMap,
      html: `<img id="marker" src="/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg">`
    });
  };

  const constructBounds = (bounds) => {
    const td = bounds["Ya"];
    const pd = bounds["Ua"];
    return {"northeast": {"lat": td["j"], "lng": pd["j"]}, "southwest": {"lat": td["i"], "lng": pd["i"]}}
  };

  const centerCoordinates = (center) => {
    return {lat: center.lat(), lng: center.lng()}
  };

  return <div ref={googleMapRef} style={{height: '100vh', width: '100%'}}/>;
}

export default Map;
