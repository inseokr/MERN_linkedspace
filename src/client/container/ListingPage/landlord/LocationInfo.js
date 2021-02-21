/* eslint-disable */
import React, {
  useContext, useEffect, useRef, useState
} from 'react';
import '../../../app.css';
import {FILE_SERVER_URL} from '../../../globalConstants';
import '../common/listing_style.css';
import { initGoogleMap, createMarker, getGeometryFromSearchString, getBoundsZoomLevel } from '../../../contexts/helper/helper';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';

import { MapContainer, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet'
import ListingCoverPage from './ListingCoverPage';
import ListingIntro from './ListingIntro';
import ExploreHome from './ExploreHome';
import HomeDetails from './HomeDetails';
import RentalTerm from './RentalTerm';
import HostDetails from './HostDetails';
import ListingControlButtons from './ListingControlButtons';

function LocationInfo() {
  const { currentListing } = useContext(CurrentListingContext);

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  const groupRef = (node) => {
    if (node !== null && map !== null) {
      const bounds = node.getBounds();
      if (Object.keys(bounds).length > 0) {
        map.fitBounds(bounds);
      }
    }
  };

  useEffect(() => {
    if (currentListing) {
      const { listing } = currentListing;
      if (listing) {
        const { rental_property_information, pictures } = listing;
        if (rental_property_information && pictures) {
          const { coordinates } = rental_property_information;
          if (coordinates && pictures.length > 0) {
            const imgSource = pictures.length === 0 ? FILE_SERVER_URL+'/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg' : FILE_SERVER_URL+pictures[0].path;
            const icon = createMarker(imgSource);
            setMarker({ position: coordinates, icon: icon });
          }
        }
      }
    }
  }, [currentListing]);

  return (
    <div className="App">
      <div className="row no_border">
        <div className="col-7">
          <div>
            <div className="_1xzp5ma3" style={{ fontSize: '100em, !important' }}>
              Location
            </div>
            <div style={{ height: '300px', marginTop: '5px' }}>
              {
                (marker ? (
                  <MapContainer id="locationInfoMapView" center={marker.position} zoom={6} scrollWheelZoom={true} whenCreated={setMap} style={{ height: '80%', width: '85%' }}>
                    <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    <FeatureGroup ref={groupRef}>
                      <Marker key={`marker`} position={marker.position} icon={marker.icon}/>
                    </FeatureGroup>
                  </MapContainer>
                ) : (<></>))
              }
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
    </div>
  );
}

export default LocationInfo;
