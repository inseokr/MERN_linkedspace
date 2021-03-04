import React, { useContext, useEffect, useRef } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import {
  constructBounds,
  centerCoordinates,
  createMarker,
  initGoogleMap
} from '../../../../contexts/helper/helper';
import { FILE_SERVER_URL } from '../../../../globalConstants';
import './Map.css';

function Map() {
  const {
    mapElementID,
    setMapElementID,
    listingsByBounds,
    mapParams,
    setMapParams
  } = useContext(ListingsContext);
  const { center, zoom } = mapParams;

  const bounds = new window.google.maps.LatLngBounds();
  const googleMapRef = useRef(null);
  let googleMap = null;

  useEffect(() => {
    setMapElementID('mapView');
  }, []);

  useEffect(() => {
    googleMap = initGoogleMap(googleMapRef, zoom, center);

    googleMap.addListener('dragend', () => {
      const idleListener = googleMap.addListener('idle', () => {
        window.google.maps.event.removeListener(idleListener);
        setMapParams({
          bounds: constructBounds(googleMap.getBounds()),
          center: centerCoordinates(googleMap.getCenter()),
          zoom: googleMap.getZoom()
        });
      });
    });

    googleMap.addListener('zoom_changed', () => {
      const idleListener = googleMap.addListener('idle', () => {
        window.google.maps.event.removeListener(idleListener);
        setMapParams({
          bounds: constructBounds(googleMap.getBounds()),
          center: centerCoordinates(googleMap.getCenter()),
          zoom: googleMap.getZoom()
        });
      });
    });

    listingsByBounds.forEach((listing) => {
      try {
        const { coordinates } = listing.rental_property_information;
        const image = listing.pictures.length > 0
          ? `${FILE_SERVER_URL}${listing.pictures[0].path}`
          : `${FILE_SERVER_URL}/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg`;
        const marker = createMarker(googleMap, coordinates, image);

        marker.addListener('click', () => {
          alert('Clicked!');
        });
        bounds.extend(coordinates);
      } catch (err) {
        console.warn(err);
      }
    });
  }, [listingsByBounds]);

  return <div id={mapElementID || 'mapView'} ref={googleMapRef} style={{ height: '100vh' }} />;
}

export default Map;
