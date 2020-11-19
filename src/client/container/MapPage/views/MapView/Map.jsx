/* eslint-disable */
import React, { useContext, useEffect, useRef } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import './Map.css';

function Map() {
  const {
    filteredListings, filterListingsByBounds, center, zoom, initGoogleMap, createMarker, constructBounds, centerCoordinates
  } = useContext(ListingsContext);
  const googleMapRef = useRef(null);
  let googleMap = null;

  useEffect(() => {
    console.log('useEffect', center, zoom, filteredListings);
    googleMap = initGoogleMap(googleMapRef, zoom, center);

    googleMap.addListener('dragend', () => {
      const idleListener = googleMap.addListener('idle', () => {
        window.google.maps.event.removeListener(idleListener);
        filterListingsByBounds(constructBounds(googleMap.getBounds()), centerCoordinates(googleMap.getCenter()), zoom);
      });
    });

    googleMap.addListener('zoom_changed', () => {
      const idleListener = googleMap.addListener('idle', () => {
        window.google.maps.event.removeListener(idleListener);
        filterListingsByBounds(constructBounds(googleMap.getBounds()), centerCoordinates(googleMap.getCenter()), googleMap.getZoom());
      });
    });

    if (filteredListings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredListings.map((listing) => {
        const { coordinates } = listing.rental_property_information;
        const imgSource = listing.requester.profile_picture.length === 0 ? FILE_SERVER_URL+'/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg' : FILE_SERVER_URL+listing.requester.profile_picture.length;
   
        const marker = createMarker(googleMap, coordinates, '/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg');
        marker.addListener('click', () => {
          alert('Clicked!');
        });
        bounds.extend(coordinates);
      });
    }
  }, [filteredListings]);

  return <div id="mapView" ref={googleMapRef} style={{ height: '100vh', width: '100vh' }} />;
}

export default Map;
