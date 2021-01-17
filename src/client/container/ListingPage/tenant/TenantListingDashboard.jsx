/* eslint-disable */
import React, {
  useState, useContext, useRef, useEffect, useCallback
} from 'react';

import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import '../../MapPage/index.css';
import './TenantListingDashboard.css'

import TenantDashboardListView from '../../MapPage/views/ListView/TenantDashboardListView';
import FilterView from '../../MapPage/views/FilterView/FilterView';
import GeneralChatMainPage from '../../GeneralChatPage/GeneralChatMainPage';
import ToggleSwitch from '../../../components/CustomControls/ToggleSwitch';
import SimpleModal from '../../../components/Modal/SimpleModal';

import {
  createMarker,
  validCoordinates
} from '../../../contexts/helper/helper';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { MessageContext } from '../../../contexts/MessageContext';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { FILE_SERVER_URL } from '../../../globalConstants';
import { preprocessUrlRequest } from '../../../utils/route_helper';

// import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet'

function TenantListingDashBoard(props) {
  const {loginClickHandler, hideLoginModal} = props;

  const {friendsMap, isUserLoggedIn, setRedirectUrlAfterLogin} = useContext(GlobalContext);
  const {doNotDisturbMode, setChildIndex, setDoNotDisturbMode} = useContext(MessageContext);
  const { currentListing, currentChildIndex, setCurrentChildIndex, fetchCurrentListing, mapParams, filterParams, setFilterParams, markerParams, setMarkerParams } = useContext(CurrentListingContext);

  const [modalShow, setModalShow] = useState(false);
  const [rightPaneMode, setRightPaneMode] = useState('Map');
  const [showMessage, setShowMessage] = useState(true);

  const { refresh, selectedMarkerID, markers } = markerParams;
  const [map, setMap] = useState(null);

  const groupRef = useCallback(node => { // useCallback instead of useRef
    if (node !== null && map !== null) {
      const bounds = node.getBounds();
      if (Object.keys(bounds).length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [map]);

  const showModal = () => {
    setModalShow(true);
  };

  const handleClose = () => {
    setModalShow(false);
  };

  const handleClickDoNotDisturbMode = () => {
    setDoNotDisturbMode(!doNotDisturbMode);
  };

  const onMarkerClick = (e, selectedMarkerID) => {
    markers.map((marker, index) => {
      const { markerID } = marker;
      if (markerID === selectedMarkerID) {
        setMarkerParams({ ...markerParams, selectedMarkerID: selectedMarkerID });
        setCurrentChildIndex(index);
        setChildIndex(index);
      }
    });
  };

  useEffect(() => { // Populate markers if ready.
    if (refresh) {
      const markers = []; // New list of markers.
      const { coordinates, _id } = currentListing;
      if (validCoordinates(coordinates)) {
        const imgSource = currentListing.profile_pictures.length === 0 ? FILE_SERVER_URL+'/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg' : FILE_SERVER_URL+currentListing.profile_pictures[0].path;
        const icon = createMarker(imgSource, (_id === selectedMarkerID));
        markers.push({ position: coordinates, icon: icon, markerID: _id });
      }

      // Get Location of any child listings if they exist.
      if (currentListing.child_listings) { // Proceed if child listings exist.
        const childListings = currentListing.child_listings;
        if (childListings.length > 0) {
          childListings.map((listing) => {
            const rentalPrice = listing.listing_id.rentalPrice;
            if (!Number.isNaN(Number(rentalPrice))) { // True if value is a number.
              const { price } = filterParams;
              const min = price[0];
              const max = price[1];
              if ((rentalPrice >= min && rentalPrice <= max) || max === 1000) {
                const { coordinates } = listing.listing_id;
                const { _id } = listing;
                if (validCoordinates(coordinates)) {
                  let imgSource = '/LS_API/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg';
                  if (listing.listing_type === 'LandlordRequest') {
                    if (listing.listing_id.pictures.length > 0) {
                      imgSource = FILE_SERVER_URL+listing.listing_id.pictures[0].path;
                    }
                  } else {
                    imgSource = FILE_SERVER_URL+listing.listing_id.coverPhoto.path;
                  }
                  const icon = createMarker(imgSource, (_id === selectedMarkerID));
                  markers.push({ position: coordinates, icon: icon, markerID: _id });
                }
              }
            }
          });
        }
      }
      setMarkerParams({ ...markerParams, markers: markers, refresh: false });
    }
  }, [refresh]);

  useEffect(() => { // Clear markers when dependencies change.
    setMarkerParams({
      refresh: map !== null && currentListing,
      markers: [],
      selectedMarkerID: selectedMarkerID
    });
  }, [map, currentListing, rightPaneMode, selectedMarkerID, mapParams, friendsMap]);

  useEffect(() => {
    fetchCurrentListing(props.match.params.id, 'tenant');
  }, [props]);

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

  const banAdditionalStyle =
      (doNotDisturbMode===true) ? {color: "rgb(243 17 76)"}: {color: "rgb(233 214 219)"};

  const { center, zoom } = mapParams;

  return (
    (isUserLoggedIn()===false)? <React.Fragment> </React.Fragment> :
      <Grid component="main">
        <CssBaseline />
        <Box className="App" component="div" display="flex" flexDirection="column">
            <span className="DashboardModeControlCaption" > Do not disturb mode </span>
            <i className="fa fa-ban fa-2x DashboardModeControl" onClick={handleClickDoNotDisturbMode} aria-hidden="true" style={banAdditionalStyle}/>
          <Grid container alignContent="stretch" >
            <Grid item xs={6}>
              <FilterView filterParams={filterParams} setFilterParams={setFilterParams} filters={{ search: true, places: false, price: true }} />
              <Grid item xs={12}>
                <TenantDashboardListView toggle={updateRightPane} mode={rightPaneMode} />
              </Grid>
            </Grid>
            <Grid className="map" item xs={6}>
              
              <React.Fragment>
                <SimpleModal show={modalShow} handle1={handleClose} caption1="close" styles={{width: '20%', height: 'auto'}}>
                  <div style={{ marginLeft: '5px' }}> Listing Summary goes here</div>
                </SimpleModal>
                <div>
                <MapContainer className='mapContainerStyle' center={center} zoom={zoom} scrollWheelZoom={true} whenCreated={setMap} >
                  <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FeatureGroup ref={groupRef}>
                    {markers.map((marker, index) =>
                      <Marker key={`marker-${index}`} position={marker.position} icon={marker.icon} eventHandlers={{click: (e) => {onMarkerClick(e, marker.markerID)}}} >
                        <Popup>
                          A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                      </Marker>
                    )}
                  </FeatureGroup>
                </MapContainer>
                </div>
              </React.Fragment>
                <section>
                  <GeneralChatMainPage id="compactChattingPage" compact="true" />
                </section>
            </Grid>
          </Grid>
        </Box>
      </Grid>
  );
}

export default TenantListingDashBoard;
