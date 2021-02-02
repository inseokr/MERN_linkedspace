/* eslint-disable */
import React, {
  useContext, useEffect, useRef, useState
} from 'react';
import '../../../app.css';
import {FILE_SERVER_URL} from '../../../globalConstants';
import '../common/listing_style.css';
import { initGoogleMap, createMarker, getGeometryFromSearchString, getBoundsZoomLevel } from '../../../contexts/helper/helper';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';

function LocationInfo() {
  const { mapLoaded, currentListing } = useContext(CurrentListingContext);
  const googleMapRef = useRef(null);
  let googleMap = null;

  useEffect(() => {
    if (mapLoaded) {
      if (currentListing) {
        const address = `${currentListing.listing.rental_property_information.location.street} ${
          currentListing.listing.rental_property_information.location.city} ${
          currentListing.listing.rental_property_information.location.state} ${
          currentListing.listing.rental_property_information.location.zipcode} ${
          currentListing.listing.rental_property_information.location.country}`;

        getGeometryFromSearchString(address).then(
          (response) => {
            if (response.status === 'OK' && document.getElementById('locationInfoMapView')) {
              const mapViewProperties = document.getElementById('locationInfoMapView').getBoundingClientRect();
              const { geometry } = response.results[0];
              const { location } = geometry;
              const bounds = new window.google.maps.LatLngBounds();
              const imgSource = currentListing.listing ? FILE_SERVER_URL+currentListing.listing.pictures[0].path : FILE_SERVER_URL+'/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg';

              /* JUSTIN-TBD
              googleMap = initGoogleMap(googleMapRef, getBoundsZoomLevel(geometry.viewport, { height: mapViewProperties.height, width: mapViewProperties.width }), location);
              const marker = createMarker(googleMap, location, imgSource);
              marker.addListener('click', () => {
                alert('Clicked!');
              });
              bounds.extend(location);
              */
            }
          }
        );
      }
    }
  }, [currentListing, mapLoaded]);

  return (
    <div className="App">
      {mapLoaded ? (
        <div className="row no_border">
          <div className="col-7">
            <div>
              <div className="_1xzp5ma3" style={{ fontSize: '100em, !important' }}>
                Location
              </div>
              <div style={{ height: '300px', marginTop: '5px' }}>
                <div id="locationInfoMapView" ref={googleMapRef} className="inner_contents" style={{ height: '80%', width: '85%' }} />
              </div>
            </div>
          </div>

          <div className="col-5" style={{ marginTop: '70px' }}>

            <div className="subtitle_info">
              <div className="sub_title">
                Neighborhood
              </div>
              <div className="inner_contents" style={{ marginTop: '2px', whiteSpace: 'pre-line' }}>
                {currentListing.listing.summary_of_neighborhood}
              </div>
            </div>

            <div className="subtitle_info" style={{ marginTop: '20px' }}>
              <div className="sub_title">
                Transportation
              </div>
              <div className="inner_contents" style={{ marginTop: '2px', whiteSpace: 'pre-line' }}>
                {currentListing.listing.summary_of_transportation}
              </div>
            </div>
          </div>
        </div>
      ) : (<div>Loading...</div>)}
    </div>
  );
}

export default LocationInfo;
