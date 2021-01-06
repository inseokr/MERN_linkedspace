/* eslint-disable */
import React, {
  useState, useContext, useRef, useEffect
} from 'react';

import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import '../../MapPage/index.css';

import TenantDashboardListView from '../../MapPage/views/ListView/TenantDashboardListView';
import FilterView from '../../MapPage/views/FilterView/FilterView';
import GeneralChatMainPage from '../../GeneralChatPage/GeneralChatMainPage';
import ToggleSwitch from '../../../components/CustomControls/ToggleSwitch';
import SimpleModal from '../../../components/Modal/SimpleModal';

import {
  initGoogleMap,
  createMarker,
  getGeometryFromSearchString
} from '../../../contexts/helper/helper';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { MessageContext } from '../../../contexts/MessageContext';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { FILE_SERVER_URL } from '../../../globalConstants';
import { preprocessUrlRequest } from '../../../utils/route_helper';

function TenantListingDashBoard(props) {
  const [modalShow, setModalShow] = useState(false);
  const {friendsMap, isUserLoggedIn, setRedirectUrlAfterLogin} = useContext(GlobalContext);
  const {doNotDisturbMode, setDoNotDisturbMode} = useContext(MessageContext);
  const {loginClickHandler, hideLoginModal} = props;

  const googleMapRef = useRef(null);
  let googleMap = null;

  const { mapElementID, setMapElementID, mapLoaded, currentListing, currentChildIndex, setCurrentChildIndex, fetchCurrentListing, mapParams, filterParams, setFilterParams } = useContext(CurrentListingContext);

  const [rightPaneMode, setRightPaneMode] = useState('Map');``
  const [showMessage, setShowMessage] = useState(true);

  const showModal = () => {
    setModalShow(true);
  };

  const handleClose = () => {
    setModalShow(false);
  };

  const handleClickDoNotDisturbMode = () => {
    // toggle the value
    setDoNotDisturbMode(!doNotDisturbMode);
  };

  useEffect(() => {
    setMapElementID('tenantListingDashboardMapView');
  }, []);

  useEffect(() => {
    const { center, zoom } = mapParams;
    if (rightPaneMode === 'Map' && mapLoaded) {
      googleMap = initGoogleMap(googleMapRef, zoom, center);
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(center);
      if (currentListing) {
        const address = `${currentListing.location.street} ${
          currentListing.location.city} ${
          currentListing.location.state} ${
          currentListing.location.zipcode} ${
          currentListing.location.country}`;

        // Get location of parent listing and set zoom and center.
        getGeometryFromSearchString(address).then(
          (response) => {
            if (response.status === 'OK') {
              const { geometry } = response.results[0];
              if (document.getElementById(mapElementID)) { // Continue if element exists.
                const { location } = geometry;
                // Location of where the tenant would prefer to stay.
                const imgSource = currentListing.profile_pictures.length === 0 ? FILE_SERVER_URL+'/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg' : FILE_SERVER_URL+currentListing.profile_pictures[0].path;
                const marker = createMarker(googleMap, location, imgSource);
                marker.addListener('click', () => {
                  // ISEO-TBD: let's open a modal
                  // showModal();
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
              const location = (listing.listing_type === 'LandlordRequest') ? listing.listing_id.rental_property_information.location : listing.listing_id.location;
              const address = `${location.street} ${
                location.city} ${
                location.state} ${
                location.zipcode} ${
                location.country}`;
              const rentalPrice = listing.listing_id.rentalPrice;
              if (!Number.isNaN(Number(rentalPrice))) { // True if value is a number.
                const { price } = filterParams;
                const min = price[0];
                const max = price[1];
                if ((rentalPrice >= min && rentalPrice <= max) || max === 1000) {
                  getGeometryFromSearchString(address).then(
                    (response) => {
                      console.warn("response="+JSON.stringify(response));
                      if (response.status === 'OK') {
                        const { geometry } = response.results[0];
                        const { location } = geometry;
                        try {
                          console.log(`listing = ${JSON.stringify(listing)}`);

                          let imgSource = '/LS_API/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg';

                          if (listing.listing_type === 'LandlordRequest') {
                            if (listing.listing_id.pictures.length > 0) {
                              imgSource = FILE_SERVER_URL+listing.listing_id.pictures[0].path;
                            }
                          } else {
                            imgSource = FILE_SERVER_URL+listing.listing_id.coverPhoto.path;
                          }

                          const marker = createMarker(googleMap, location, imgSource, (index === currentChildIndex));

                          marker.addListener('click', (clickedIndex = index) => {
                            if (clickedIndex !== currentChildIndex) { // update currentChildIndex if it's different
                              setCurrentChildIndex(clickedIndex);
                            }
                          });
                          bounds.extend(location);
                          googleMap.fitBounds(bounds);
                        } catch (err) {
                          console.warn(`adding marker failed. error = ${err}`);
                        }
                      }
                    }
                  );
                }
              }
            });
          }
        }
        // googleMap.fitBounds(bounds);
      }
    }
  }, [currentListing, rightPaneMode, currentChildIndex, mapParams, friendsMap]);

  useEffect(() => {
    fetchCurrentListing(props.match.params.id, 'tenant');
  }, [props]);

  const markerOperations = () => {

  };

  const updateRightPane = (reload) => {
    if (rightPaneMode === 'Map') {
      if (!reload) {
        setRightPaneMode('Message');
      }
    } else if (reload) {
      setShowMessage(false);
      setTimeout(() => {
        setShowMessage(true);
      }, 100);
    } else {
      setRightPaneMode('Map');
    }
  };


  let banAdditionalStyle = 
      (doNotDisturbMode===true) ? {color: "rgb(243 17 76)"}: {color: "rgb(233 214 219)"};

  return (
    (isUserLoggedIn()===false)? <React.Fragment> </React.Fragment> :
    <div>
      {mapLoaded ? (
        <Grid component="main">
          <CssBaseline />
          <Box className="App" component="div" display="flex" flexDirection="column">
            <ToggleSwitch leftCaption="Map" rightCaption="Message" clickHandler={updateRightPane} />
            <i className="fa fa-ban fa-2x DashboardModeControl" onClick={handleClickDoNotDisturbMode} aria-hidden="true" style={banAdditionalStyle}></i>
            <Grid container alignContent="stretch" >
              <Grid item xs={6}>
                <FilterView filterParams={filterParams} setFilterParams={setFilterParams} filters={{ search: true, places: false, price: true }} />
                <Grid item xs={12}>
                  <TenantDashboardListView toggle={updateRightPane} mode={rightPaneMode} />
                </Grid>
              </Grid>
              <Grid className="map" item xs={6}>
                <React.Fragment>
                  <SimpleModal show={modalShow} handle1={handleClose} caption1="close" _width="20%">
                    <div style={{ marginLeft: '5px' }}> Listing Summary goes here</div>
                  </SimpleModal>
                  <div id={mapElementID || 'tenantListingDashboardMapView'} ref={googleMapRef} style={{ height: '50%', width: '99vh' }} />
                </React.Fragment>
                <React.Fragment>
                  <GeneralChatMainPage compact="true" />
                </React.Fragment>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ) : (<div>Loading...</div>)}
    </div>
  );
}

export default TenantListingDashBoard;
