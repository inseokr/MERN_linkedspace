/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import '../../MapPage/index.css';
import './TenantListingDashboard.css';

import TenantDashboardListView from '../../MapPage/views/ListView/TenantDashboardListView';
import FilterView from '../../MapPage/views/FilterView/FilterView';
import GeneralChatMainPage from '../../GeneralChatPage/GeneralChatMainPage';
import SimpleModal from '../../../components/Modal/SimpleModal';
import { FILE_SERVER_URL, STYLESHEET_URL } from '../../../globalConstants';

import {
  createMarker,
  getGeometryFromSearchString,
  validCoordinates
} from '../../../contexts/helper/helper';

import DashboardMarker from '../../../contexts/helper/DashboardMarker';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import {
  MessageContext,
  MSG_CHANNEL_TYPE_GENERAL,
  MSG_CHANNEL_TYPE_LISTING_CHILD,
  MSG_CHANNEL_TYPE_LISTING_PARENT
} from '../../../contexts/MessageContext';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { Circle, FeatureGroup, MapContainer, Popup, TileLayer } from 'react-leaflet';

function TenantListingDashBoard(props) {
  const {loginClickHandler, hideLoginModal} = props;

  const {friendsMap, isUserLoggedIn, setRedirectUrlAfterLogin, currentUser} = useContext(GlobalContext);

  const {
    doNotDisturbMode,
    setChildIndex,
    setDoNotDisturbMode,
    broadcastDashboardMode,
    toggleCollapse,
    collapse,
    setChattingContextType,
    chattingContextType
  } = useContext(MessageContext);

  const { currentListing, currentChildIndex, setCurrentChildIndex, getChildListingUrl, fetchCurrentListing, mapParams, setMapParams, filterParams, setFilterParams, markerParams, setMarkerParams } = useContext(CurrentListingContext);

  const [modalShow, setModalShow] = useState(false);
  const [map, setMap] = useState(null);
  const { refresh, selectedMarkerID, markers } = markerParams;
  const { search } = filterParams;
  const { bounds, center, zoom } = mapParams;

  const groupRef = (node) => {
    if (node !== null && map !== null) {
      if (bounds === null) { //fitBounds will happen only if parent listing is selected.
        const bounds = node.getBounds();
        if (Object.keys(bounds).length > 0) {
          map.fitBounds(bounds);
          setMapParams({ bounds, center: map.getCenter(), zoom: map.getZoom() });
        }
      }
    }
  };

  const handleClose = () => {
    setModalShow(false);
  };

  const handleClickDoNotDisturbMode = () => {
    if (currentListing.requester.username === currentUser.username) {
      broadcastDashboardMode((!doNotDisturbMode) ? "locked" : "normal");
    }
    setDoNotDisturbMode(!doNotDisturbMode);
  };

  const onMarkerClick = (e, selectedMarkerID) => {
    markers.map((marker, index) => {
      const { markerID } = marker;
      if (markerID === selectedMarkerID) {
        setMarkerParams({ ...markerParams, selectedMarkerID: selectedMarkerID });
        setCurrentChildIndex(index-1);
        setChildIndex(index-1);
      }
    });
  };

  useEffect(() => { // Populate markers if ready.
    if (refresh) {
      const markers = []; // New list of markers.
      const { coordinates, _id, child_listings } = currentListing;
      if (validCoordinates(coordinates)) {
        const imgSource = currentListing.profile_pictures.length === 0 ? FILE_SERVER_URL+'/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg' : FILE_SERVER_URL+currentListing.profile_pictures[0].path;
        const markerSelected = _id === selectedMarkerID;
        console.log("B R O O O ", _id, selectedMarkerID);
        const icon = createMarker({type: "image", data: imgSource}, markerSelected);
        markers.push({ position: coordinates, icon: icon, markerID: _id, selected: markerSelected }); // Add parent listing marker.
      }

      if (child_listings) { // Add child listings markers if they exist.
        if (child_listings.length > 0) {
          child_listings.map((listing) => {
            if(listing===null || listing.listing_id===null) return;

            const rentalPrice = (listing.listing_id.listingType === "landlord") ? Number(listing.listing_id.rental_terms.asking_price) : listing.listing_id.rentalPrice;

            if (!Number.isNaN(rentalPrice)) { // True if value is a number.
              const { price } = filterParams;
              const min = price[0];
              const max = price[1];

              if ((rentalPrice >= min && rentalPrice <= max) || max === 10000) {
                const { coordinates } = (listing.listing_id.listingType === "landlord") ? listing.listing_id.rental_property_information : listing.listing_id;
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
                  const _price = (listing.listing_id.listingType === "landlord")?
                    listing.listing_id.rental_terms.asking_price:
                    listing.listing_id.rentalPrice;
                  const markerSelected = !!(_id === selectedMarkerID && currentChildIndex !== -1);
                  const icon = createMarker({type: "price", data: _price}, markerSelected);
                  markers.push({ position: coordinates, icon: icon, markerID: _id, selected: markerSelected });
                }
              }
            }
          });
        }
      }
      setMarkerParams({ ...markerParams, markers: markers, refresh: false });
    }
  }, [refresh, currentChildIndex]);

  useEffect(() => {
    if (map && bounds && markers.length > 0) {
      const { _id: id } = currentListing; // ID of Parent Listing.
      markers.map((marker) => {
        const { position, markerID, selected } = marker;
        if (selected) {
          if (id !== markerID) { // // Child Listing
            const modifiedCoordinates = collapse === 'true' ? position : modifyCoordinate(bounds, position);
            map.flyTo(modifiedCoordinates, 15, { animate: true, duration: 2.0 });
          }
        }
      });
    }
  }, [bounds, markers, collapse]);

  useEffect(() => {
    if (currentListing) {
      setMapParams({ ...mapParams, bounds: null }); // Reset map bounds.
      setMarkerParams({ refresh: true, selectedMarkerID: null, markers: [] }); // Refresh for both parent and child.
    }
  }, [currentListing, map, friendsMap]);

  // TODO Old code. May need.
  // useEffect(() => {
  //   if (map && bounds && currentListing && selectedMarkerID) {
  //     const { _id: id, coordinates } = currentListing;
  //     if (id === selectedMarkerID && coordinates) {
  //       setMapParams({ ...mapParams, bounds: null });
  //     } else {
  //       const { child_listings } = currentListing;
  //       if (map && child_listings && child_listings.length > 0) {
  //         child_listings.map((listing) => {
  //           const { _id: id, listing_id } = listing;
  //           if (listing_id) {
  //             const { coordinates } = listing_id;
  //             if (id === selectedMarkerID && coordinates) {
  //               const modifiedCoordinates = collapse === 'true' ? coordinates : modifyCoordinate(bounds, coordinates);
  //               map.flyTo(modifiedCoordinates, 15, { animate: true, duration: 2.0 });
  //             }
  //           }
  //         });
  //       }
  //     }
  //     setMarkerParams({ refresh: true, selectedMarkerID: selectedMarkerID, markers: [] }); // Refresh for both parent and child.
  //   }
  // }, [map, bounds, currentListing, selectedMarkerID, friendsMap, collapse]);

  useEffect(() => { // fly to coordinate from updated search.
    if (map && search.length > 0) {
      getGeometryFromSearchString(search).then(response => {
        const { results, status } = response;
        if (status === "OK" && results.length > 0) {
          const { geometry } = results[0];
          if (geometry) {
            const { location } = geometry;
            if (location) {
              map.flyTo(location, 15, { animate: true, duration: 2.0 });
            }
          }
        }
      });
    }
  }, [map, search]);

  useEffect(() => {
    fetchCurrentListing(props.match.params.id, 'tenant');
  }, [props]);

  useEffect(() => {
    // let's set the chatting context when listing is properly updated.
    // <note> chatting context should be updated only when listing's updated.

    let contextType =
      (chattingContextType === MSG_CHANNEL_TYPE_GENERAL && currentListing!==undefined)
        ? MSG_CHANNEL_TYPE_LISTING_PARENT : chattingContextType;

    setChattingContextType(contextType);

    if(contextType!==MSG_CHANNEL_TYPE_LISTING_CHILD) {
      //console.warn(`currentListing has been updated, index will be set to -1`);
      setCurrentChildIndex(-1);
      setChildIndex(-1);
    }
  }, [currentListing]);

  function modifyCoordinate(bounds, coordinate) {
    const {lat, lng} = coordinate;
    const {_northEast: northEast, _southWest: southWest} = bounds;

    if (lat && lng && northEast && southWest) {
      const latOffSet = Math.abs((northEast.lat - southWest.lat) / 20);
      const lngOffSet = Math.abs((southWest.lng - northEast.lng) / 15);
      return {
        lat: lat - latOffSet,
        lng: lng + lngOffSet
      };
    }

    return coordinate;
  }

  function controlMessageWindow() {
    if (collapse === 'true' && bounds) {
      const coordinate =
        (currentChildIndex===-1) ?
          currentListing.coordinates :
          (currentListing.child_listings[currentChildIndex].listing_id.listingType==="landlord") ?
            currentListing.child_listings[currentChildIndex].listing_id.rental_property_information.coordinates:
            currentListing.child_listings[currentChildIndex].listing_id.coordinates;
      console.log("controlMessageWindow", )
      map.flyTo(modifyCoordinate(bounds, coordinate), 15, { animate: true, duration: 1.5 });
    }
    toggleCollapse();
  }

  const banAdditionalStyle = (doNotDisturbMode===true) ? {color: "rgb(243 17 76)"}: {color: "rgb(233 214 219)"};
  const mapMessageContainerStyle = { };
  const chatContainerStyle = { position: 'absolute', top: '0', right: '20%'};

  return (
    (isUserLoggedIn()===false)?
      <div>
        <link rel="stylesheet" href={STYLESHEET_URL+"/stylesheets/landing.css"}/>
        <div className="container landingPage" >
        </div>
      </div>
      :
      <Grid container direction="row" justify="space-evenly">
        <Grid item xs={12}>
          <CssBaseline />
          <Box className="App" component="div" display="flex" flexDirection="column">
            <span className="DashboardModeControlCaption" > Do not disturb mode </span>
            <i className="fa fa-ban fa-2x DashboardModeControl" onClick={handleClickDoNotDisturbMode} aria-hidden="true" style={banAdditionalStyle}/>
            <Grid container alignContent="stretch" >
              <Grid item xs={5}>
                <FilterView filterParams={filterParams} setFilterParams={setFilterParams} filters={{ search: true, places: false, price: true }} />
                <Grid item xs={12}>
                  <TenantDashboardListView/>
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
                          {
                            markers.map((marker, index) =>
                              <DashboardMarker key={`marker-${index}`} position={marker.position} markerIndex={index-1} icon={marker.icon} markerSelected={marker.selected} eventHandlers={{click: (e) => {onMarkerClick(e, marker.markerID)}}}>
                                <Popup>
                                  <section style={{display: 'grid', gridTemplateColumns: '1fr 1fr', color: '#115399'}}>
                                    <section style={{marginTop: '3px'}}>
                                      <a href={(index === 0)? `/listing/tenant/${currentListing._id}/get`: getChildListingUrl(index-1)} target="_blank">
                                        <i className="fas fa-external-link-alt fa-lg"/>
                                      </a>
                                    </section>
                                    <section onClick={() => {controlMessageWindow()} } style={{color: '#a52a2a'}}>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" width="24" height="24" focusable="false">
                                        <path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z">
                                        </path>
                                      </svg>
                                    </section>
                                  </section>
                                </Popup>
                                {(currentListing !== undefined) && (currentListing.coordinates !== undefined) &&
                                <Circle
                                  center={{lat: currentListing.coordinates.lat, lng: currentListing.coordinates.lng}}
                                  fillColor="gray"
                                  radius={1000}/>}
                              </DashboardMarker>
                            )
                          }
                        </FeatureGroup>
                      </MapContainer>
                    </div>
                  </React.Fragment>
                </div>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
  );
}

export default TenantListingDashBoard;
