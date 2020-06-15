import React, { useContext, useEffect, useRef, useState } from 'react';
import "../../../app.css";
import "../common/listing_style.css";
import { ListingsContext } from '../../../contexts/ListingsContext';
import { CurrentListingContext } from "../../../contexts/CurrentListingContext";

function LocationInfo() {
  const {mapLoaded, initGoogleMap, createMarker, getGeometryFromSearchString, getBoundsZoomLevel} = useContext(ListingsContext);
  const googleMapRef = useRef(null);
  let googleMap = null;

  const {currentListing} = useContext(CurrentListingContext);

  const [center, setCenter] = useState({lat:37.338207, lng:-121.886330});
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    googleMap = initGoogleMap(googleMapRef, zoom, center);

    if (currentListing) {
      const address = currentListing.listing.rental_property_information.location.street + " " +
        currentListing.listing.rental_property_information.location.city + " " +
        currentListing.listing.rental_property_information.location.state + " " +
        currentListing.listing.rental_property_information.location.zipcode + " " +
        currentListing.listing.rental_property_information.location.country;

      getGeometryFromSearchString(address).then(
        response => {
          if (response.status === "OK") {
            let geometry = response.results[0].geometry;
            if (document.getElementById('locationInfoMapView')) { // Continue if element exists.
              const mapViewProperties = document.getElementById('locationInfoMapView').getBoundingClientRect();
              setCenter(geometry.location);
              setZoom(getBoundsZoomLevel(geometry.viewport, {height: mapViewProperties.height, width: mapViewProperties.width}));
            }
          }
        }
      );

      const bounds = new window.google.maps.LatLngBounds();
      createMarker(googleMap, center);
      bounds.extend(center);
    }
  }, [zoom]);

	return (
    <div className="App">
      {mapLoaded ? (
        <div className="row no_border">
          <div className="col-7">
            <div>
              <div className="_1xzp5ma3" style={{fontSize:"100em, !important"}}>
                Location
              </div>
              <div style={{height:"300px", marginTop:"5px"}}>
                <div id="locationInfoMapView" ref={googleMapRef} className="inner_contents" style={{height:"80%",width:"85%"}}/>
              </div>
            </div>
          </div>

          <div className="col-5" style={{marginTop:"70px"}}>

            <div className="subtitle_info">
              <div className="sub_title">
                Neighborhood
              </div>
              <div className="inner_contents" style={{marginTop:"2px", whiteSpace:"pre-line"}}>
                {currentListing.listing.summary_of_neighborhood}
              </div>
            </div>

            <div className="subtitle_info" style={{marginTop:"20px"}}>
              <div className="sub_title">
                Transportation
              </div>
              <div className="inner_contents" style={{marginTop:"2px",whiteSpace:"pre-line"}}>
                {currentListing.listing.summary_of_transportation}
              </div>
            </div>
          </div>
        </div>
      ) : (<div>Loading...</div>)}
    </div>
	);

}

export default LocationInfo
