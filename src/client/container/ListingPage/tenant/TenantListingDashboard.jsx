/* eslint-disable */
import React, {
  useState, useContext, useRef, useEffect
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

  const {friendsMap, isUserLoggedIn, setRedirectUrlAfterLogin, currentUser} = useContext(GlobalContext);
  const {doNotDisturbMode, childIndex, setChildIndex, setDoNotDisturbMode, broadcastDashboardMode, toggleCollapse} = useContext(MessageContext);
  const { currentListing, currentChildIndex, setCurrentChildIndex, getChildListingUrl, fetchCurrentListing, mapParams, filterParams, setFilterParams, markerParams, setMarkerParams } = useContext(CurrentListingContext);

  const [modalShow, setModalShow] = useState(false);
  const [rightPaneMode, setRightPaneMode] = useState('Map');
  const [showMessage, setShowMessage] = useState(true);
  const { refresh, selectedMarkerID, markers } = markerParams;
  const [map, setMap] = useState(null);

  const groupRef = (node) => {
    if (node !== null && map !== null) {
      const bounds = node.getBounds();
      if (Object.keys(bounds).length > 0) {
        //fitBounds will happen only if parent listing is selected.
        if(currentChildIndex===-1)
        {
          map.fitBounds(bounds);
        }
      }
    }
  };

  const showModal = () => {
    setModalShow(true);
  };

  const handleClose = () => {
    setModalShow(false);
  };

  const handleClickDoNotDisturbMode = () => {

    if(currentListing.requester.username === currentUser.username )
    {
      broadcastDashboardMode((doNotDisturbMode===false)? "locked": "normal");
    }

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
            if(listing===null || listing.listing_id===null) return;

            const rentalPrice = 
              (listing.listing_id.listingType==='landlord')? 
                Number(listing.listing_id.rental_terms.asking_price): 
                listing.listing_id.rentalPrice;

            if (!Number.isNaN(rentalPrice)) { // True if value is a number.
              const { price } = filterParams;
              const min = price[0];
              const max = price[1];

              if ((rentalPrice >= min && rentalPrice <= max) || max === 1000) {
                const { coordinates } = 
                  (listing.listing_id.listingType==="landlord")? 
                    listing.listing_id.rental_property_information: 
                    listing.listing_id;
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
                else
                {
                  console.warn(`validation of coordinate failure. coordinates=${JSON.stringify(coordinates)}`);
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

  //let mapMessageContainerStyle = { display: 'grid', gridTemplateColumns: '4fr 8fr'};
  let mapMessageContainerStyle = { };
  let chatContainerStyle = { position: 'absolute', top: '0', right: '20%'};

  return (
    (isUserLoggedIn()===false)? <React.Fragment> </React.Fragment> :
      <Grid component="main">
        <CssBaseline />
        <Box className="App" component="div" display="flex" flexDirection="column">
            <span className="DashboardModeControlCaption" > Do not disturb mode </span>
            <i className="fa fa-ban fa-2x DashboardModeControl" onClick={handleClickDoNotDisturbMode} aria-hidden="true" style={banAdditionalStyle}/>
          <Grid container alignContent="stretch" >
            <Grid item xs={5}>
              <FilterView filterParams={filterParams} setFilterParams={setFilterParams} filters={{ search: true, places: false, price: true }} />
              <Grid item xs={12}>
                <TenantDashboardListView toggle={updateRightPane} mode={rightPaneMode} />
              </Grid>
            </Grid>
            <Grid className="map" item xs={7}>
              
              <div style={mapMessageContainerStyle}> 
              <section style={chatContainerStyle}>
                <GeneralChatMainPage id="compactChattingPage" compact="true" meeting="true"/>
              </section>

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
                          <section style={{display: 'grid', gridTemplateColumns: '1fr 1fr', color: '#115399'}}>
                            <section style={{marginTop: '3px'}}> 
                              <a href={getChildListingUrl()} target="_blank">
                                <i class="fas fa-external-link-alt fa-lg"></i> 
                              </a>
                            </section>
                            <section onClick={() => {toggleCollapse();} } style={{color: '#a52a2a'}}> 
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="24" height="24" focusable="false">
                                <path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z">
                                </path>
                              </svg>
                            </section>
                          </section>
                        </Popup>
                      </Marker>
                    )}
                  </FeatureGroup>
                </MapContainer>
                </div>
              </React.Fragment>

              </div>

            </Grid>
          </Grid>
        </Box>
      </Grid>
  );
}

export default TenantListingDashBoard;
