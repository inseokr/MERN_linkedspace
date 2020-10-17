import React, { useState, useContext, useRef, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import "../../MapPage/index.css";

import TenantDashboardListView from '../../MapPage/views/ListView/TenantDashboardListView';
import FilterView from '../../MapPage/views/FilterView/FilterView';
import GeneralChatMainPage from '../../GeneralChatPage/GeneralChatMainPage';
import ToggleSwitch from '../../../components/CustomControls/ToggleSwitch';
import SimpleModal from '../../../components/Modal/SimpleModal';

import { ListingsContext } from '../../../contexts/ListingsContext';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';


function TenantListingDashBoard(props) {
  const [modalShow, setModalShow] = useState(false);

  const {mapLoaded, initGoogleMap, createMarker, getGeometryFromSearchString, getBoundsZoomLevel} = useContext(ListingsContext);
  const googleMapRef = useRef(null);
  let googleMap = null;

  const {currentListing, currentChildIndex, setCurrentChildIndex, fetchCurrentListing} = useContext(CurrentListingContext);

  const [center, setCenter] = useState({lat:37.338207, lng:-121.886330});
  const [zoom, setZoom] = useState(9);
  const [rightPaneMode, setRightPaneMode] = useState("Map");
  const [showMessage, setShowMessage] = useState(true);

  let showModal = () => {
    setModalShow(true);
  };

  let handleClose = () => {
    setModalShow(false);
  };

  useEffect(() => {
    if (rightPaneMode === "Map" && mapLoaded) {
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
                  // ISEO-TBD: let's open a modal
                  //showModal();
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

          if (childListings.length > 0) {
            childListings.map((listing, index) => {
              const location = (listing.listing_type === "LandlordRequest")? listing.listing_id.rental_property_information.location: listing.listing_id.location;
              const address = location.street + " " +
                location.city + " " +
                location.state + " " +
                location.zipcode + " " +
                location.country;

              getGeometryFromSearchString(address).then(
                response => {
                  if (response.status === "OK") {
                    const geometry = response.results[0].geometry;
                    const location = geometry.location;
                    const imgSource = listing.listing_id.pictures.length > 0 ? listing.listing_id.pictures[0].path : "/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg";
                    const marker = createMarker(googleMap, location, imgSource, (index===currentChildIndex));

                    marker.addListener("click", (clickedIndex=index) => {
                      if(clickedIndex!==currentChildIndex) { // update currentChildIndex if it's different
                        setCurrentChildIndex(clickedIndex);
                      }
                    });
                    bounds.extend(location);
                    googleMap.fitBounds(bounds);
                  }
                }
              );
            });
          }
        }
        // googleMap.fitBounds(bounds);
      }
    }
  }, [currentListing, zoom, rightPaneMode, currentChildIndex]);

  useEffect(() => {
    fetchCurrentListing(props.match.params.id, "tenant");
  }, [props]);

  const markerOperations = () => {

  };

  const updateRightPane = (reload) => {
    if (rightPaneMode === "Map") {
      if(!reload) {
        setRightPaneMode("Message");
      }
    } else {
      if(reload) {
        setShowMessage(false);
        setTimeout(()=> {
          setShowMessage(true);
        }, 100);
      } else {
        setRightPaneMode("Map");
      }
    }
  };

  return (
    <div>
      {mapLoaded ? (
        <Grid component="main">
          <CssBaseline />
          <Box className="App" component="div" display="flex" flexDirection="column">
            <ToggleSwitch leftCaption="Map" rightCaption="Message" clickHandler={updateRightPane}/>
            <Grid container alignContent="stretch">
              <Grid item xs={6}>
                <FilterView/>
                <Grid item xs={12}>
                  <TenantDashboardListView toggle={updateRightPane} mode={rightPaneMode}/>
                </Grid>
              </Grid>
              <Grid className="map" item xs={6}>
                {rightPaneMode === "Map" ? (
                  <React.Fragment>
                    <SimpleModal show={modalShow} handleClose={handleClose} captionCloseButton="close" _width="20%">
                      <div style={{marginLeft: "5px"}}> Listing Summary goes here</div>
                    </SimpleModal>

                    <div id="tenantListingDashboardMapView" ref={googleMapRef} style={{height: '100vh', width: '100vh'}}/>
                  </React.Fragment>
                ) : (
                  (showMessage)?
                    (<GeneralChatMainPage compact="true"/>) : (<div> </div>)
                )
                }
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ) : (<div>Loading...</div>)}
    </div>
  );
}

export default TenantListingDashBoard
