import React, { useState, useContext, useRef, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import "../../MapPage/index.css";

import TenantDashboardListView from '../../MapPage/views/ListView/TenantDashboardListView';
import InitiateMap from '../../MapPage/views/MapView/InitiateMap';
import FilterView from '../../MapPage/views/FilterView/FilterView';
import GeneralChatMainPage from '../../GeneralChatPage/GeneralChatMainPage';

import { ListingsContext } from '../../../contexts/ListingsContext';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';


function TenantListingDashBoard(props) {

  const {mapLoaded, initGoogleMap, createMarker, getGeometryFromSearchString, getBoundsZoomLevel} = useContext(ListingsContext);
  const googleMapRef = useRef(null);
  let googleMap = null;

  const {currentListing, fetchCurrentListing} = useContext(CurrentListingContext);

  const [center, setCenter] = useState({lat:37.338207, lng:-121.886330});
  const [zoom, setZoom] = useState(9);
  const [rightPaneMode, setRightPaneMode] = useState("Map");

  useEffect(() => {
    if (rightPaneMode === "Map") {
      let bounds = new window.google.maps.LatLngBounds();
      googleMap = initGoogleMap(googleMapRef, zoom, center);

      if (currentListing) {
        const address = currentListing.location.street + " " +
          currentListing.location.city + " " +
          currentListing.location.state + " " +
          currentListing.location.zipcode + " " +
          currentListing.location.country;

        // Get location of parent listing and set zoom and center.
        getGeometryFromSearchString(address).then(
          response => {
            if (response.status === "OK") {
              const geometry = response.results[0].geometry;
              if (document.getElementById('tenantListingDashboardMapView')) { // Continue if element exists.
                const mapViewProperties = document.getElementById('tenantListingDashboardMapView').getBoundingClientRect();
                const location = geometry.location;
                setCenter(location);
                setZoom(getBoundsZoomLevel(geometry.viewport, {height: mapViewProperties.height, width: mapViewProperties.width}));
                // Location of where the tenant would prefer to stay.
                const imgSource = currentListing.profile_pictures.length === 0 ? "/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg" : currentListing.profile_pictures[0].path;
                const marker = createMarker(googleMap, location, imgSource);
                marker.addListener("click", () => {
                  alert("Clicked!");
                });
                bounds.extend(location);
                googleMap.fitBounds(bounds);
              }
            }
          }
        );

        // Get location of any child listings if they exist.
        if (currentListing.child_listings) { // Proceed if child listings exist.
          const childListings = currentListing.child_listings;
          const thirdPartyListings = childListings._3rd_party_listings;
          const internalListings = childListings.internal_listings;

          if (thirdPartyListings.length > 0) {
            thirdPartyListings.map(thirdPartyListing => {
              const address = thirdPartyListing.listing_id.location.street + " " +
                thirdPartyListing.listing_id.location.city + " " +
                thirdPartyListing.listing_id.location.state + " " +
                thirdPartyListing.listing_id.location.zipcode + " " +
                thirdPartyListing.listing_id.location.country;

              getGeometryFromSearchString(address).then(
                response => {
                  if (response.status === "OK") {
                    const geometry = response.results[0].geometry;
                    const location = geometry.location;
                    const imgSource = thirdPartyListing.listing_id.coverPhoto.length === 0 ? "/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg" : thirdPartyListing.listing_id.coverPhoto.path;
                    const marker = createMarker(googleMap, location, imgSource);
                    marker.addListener("click", () => {
                      alert("Clicked!");
                    });
                    bounds.extend(location);
                    googleMap.fitBounds(bounds);
                  }
                }
              );
            });
          }

          if (internalListings.length > 0) {

          }
        }
        // googleMap.fitBounds(bounds);
      }
    }
  }, [currentListing, zoom, rightPaneMode]);

  useEffect(() => {
    fetchCurrentListing(props.match.params.id, "tenant");
  }, [props]);

  const markerOperations = () => {

  };

  const toggleRightPaneMode = () => {
    if (rightPaneMode === "Map") {
      setRightPaneMode("Message");
    } else {
      setRightPaneMode("Map");
    }
  };

  return (
    <div>
      {mapLoaded ? (
        <Grid component="main">
          <CssBaseline />
          <Box className="App" component="div" display="flex" flexDirection="column">
            <Grid container alignContent="stretch">
              <Grid item xs={6}>
                <FilterView/>
                <Grid item xs={12}>
                  <TenantDashboardListView toggle={toggleRightPaneMode} mode={rightPaneMode}/>
                </Grid>
              </Grid>
              <Grid className="map" item xs={6}>
                {rightPaneMode === "Map" ? (
                  <div id="tenantListingDashboardMapView" ref={googleMapRef} style={{height: '100vh', width: '100vh'}}/>
                ) : (
                  <GeneralChatMainPage compact="true"/>
                )}
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ) : (<div>Loading...</div>)}
    </div>
  );
}

export default TenantListingDashBoard
