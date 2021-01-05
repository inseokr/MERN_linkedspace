import axios from 'axios';
import createHTMLMapMarker from './createHTMLMapMarker';

// const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY_LINKEDSPACES;
const HERE_API_KEY = process.env.REACT_APP_HERE_API_KEY;

// Load the google map script.
function loadGoogleMapScript(callback) {
  console.warn(`GOOGLE_MAP_API_KEY=${GOOGLE_MAP_API_KEY}`);
  // console.warn(`GOOGLE_MAP_API_KEY1=${GOOGLE_MAP_API_KEY1}`);

  if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
    callback();
  } else {
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}`;
    window.document.body.appendChild(googleMapScript);
    googleMapScript.addEventListener('load', callback);
  }
}

function initGoogleMap(googleMapRef, zoom, center) { // Initialize the google map
  if (googleMapRef) {
    return new window.google.maps.Map(googleMapRef.current, {
      zoom, center, mapTypeControl: false, streetViewControl: false
    });
  }
  return undefined;
}

// Get geometry from google API.
async function getGeometryFromSearchString(search) {
  if (0) {
    await axios.get(`https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${HERE_API_KEY}&searchtext=${search}`).then((result) => {
    // data.Response.View[0].Result[0].Location.DisplayPosition;
      console.warn(`result = ${JSON.stringify(result.data.Response.View[0].Result[0].Location.DisplayPosition)}`);
      alert(`Result = ${JSON.stringify(result)}`);
    })
      .catch((err) => {
        console.log(err);
      });
  }

  return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${GOOGLE_MAP_API_KEY}`).then(response => response.json());
}

// Construct a marker using createHTMLMapMarker
function createMarker(googleMap, coordinates, imgSource, markerSelected) {
  const latLng = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
  const htmlObject = (markerSelected === true) ? `<img id="marker_selected" class="bounce" src="${imgSource}" alt="Selected Marker">` : `<img id="marker_default" class="bounce" src="${imgSource}" alt="Default Marker">`;
  return createHTMLMapMarker({
    latlng: latLng,
    map: googleMap,
    html: htmlObject
  });
}

// Get the zoom for a given bound.
function getBoundsZoomLevel(bounds, mapDim) {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;

  function latRad(lat) {
    const sin = Math.sin(lat * Math.PI / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.northeast;
  const sw = bounds.southwest;

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

  const lngDiff = ne.lng - sw.lng;
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

// Construct center object.
function centerCoordinates(center) {
  return { lat: center.lat(), lng: center.lng() };
}

// Construct the correct bounds object to use.
function constructBounds(bounds) {
  const [northeast, southwest] = Object.keys(bounds);
  return {
    northeast: { lat: bounds[northeast].j || 37.5, lng: bounds[southwest].j || -121.9 },
    southwest: { lat: bounds[northeast].i || 37.5, lng: bounds[southwest].i || -122 }
  };
}

async function updateRentalPropertyInformation(listing) {
  const rentalPropertyInformation = listing.rental_property_information;
  const { location } = rentalPropertyInformation;
  const address = `${location.street}, ${location.city}, ${location.state}, ${location.zipcode}, ${location.country}`;
  const response = await getGeometryFromSearchString(address);
  if (response && response.status === 'OK') {
    const coordinates = response.results[0].geometry.location;
    const { lat, lng } = coordinates;
    return {
      ...listing,
      rental_property_information: {
        ...rentalPropertyInformation,
        address,
        coordinates: { lat, lng }
      }
    };
  }
  return listing;
}

async function getLandLordRequests() {
  const listings = await fetch('/LS_API/getData').then(data => data.json());
  const promises = [];
  for (let i = 0; i < listings.length; i += 1) {
    const listing = listings[i];
    promises.push(updateRentalPropertyInformation(listing));
  }
  return Promise.all(promises); // Add address and coordinates to object.
}

// Function to check if coordinates within bounds.
function isInsideBounds(coordinates, northeast, southwest) {
  const normalizeDegrees = v => (v < 0 ? 360 + (v % 360) : (v % 360));
  return southwest.lat < coordinates.lat
    && northeast.lat > coordinates.lat
    && normalizeDegrees(coordinates.lng - southwest.lng)
    < normalizeDegrees(northeast.lng - southwest.lng);
}

function updateListingsByBounds(listings, bounds) {
  const filteredListings = [];
  for (let i = 0; i < listings.length; i += 1) {
    const listing = listings[i];
    if (isInsideBounds(listing.rental_property_information.coordinates,
      bounds.northeast, bounds.southwest)) {
      filteredListings.push(listing);
    }
  }

  return filteredListings;
}

// Logic for filtering a listing by filterParams
function filteredByParams(roomType, askingPrice, coordinates, filterParams, boundParams) {
  if (filterParams.places[roomType]) {
    const { price } = filterParams;
    const min = price[0];
    const max = price[1];
    if ((askingPrice >= min && askingPrice <= max) || max === 1000) {
      const { bounds } = boundParams;
      if (bounds) {
        if (isInsideBounds(coordinates, bounds.northeast, bounds.southwest)) {
          return true;
        }
      }
    }
  }
  return false;
}

async function updateListingsByFilters(mapElementID, listings, filterParams) {
  const { search } = filterParams;
  if (search.length > 0) {
    const geometry = await getGeometryFromSearchString(search);
    if (geometry.status === 'OK') {
      const { location, viewport } = geometry.results[0].geometry;

      if (document.getElementById(mapElementID)) { // Continue if element exists.
        const updatedFilteredListings = [];
        const mapViewProperties = document.getElementById(mapElementID).getBoundingClientRect();
        const zoomLevel = getBoundsZoomLevel(viewport, {
          height: mapViewProperties.height,
          width: mapViewProperties.width
        });
        const boundParams = {
          bounds: viewport,
          center: location,
          zoom: zoomLevel
        };

        for (let i = 0; i < listings.length; i += 1) {
          const listing = listings[i];
          const { room_type: roomType, coordinates } = listing.rental_property_information;
          const askingPrice = listing.rental_terms.asking_price;
          if (filteredByParams(roomType, askingPrice, coordinates, filterParams, boundParams)) {
            updatedFilteredListings.push(listing);
          }
        }

        return [updatedFilteredListings, boundParams];
      }
    }
  }

  return null;
}

export {
  loadGoogleMapScript,
  initGoogleMap,
  getGeometryFromSearchString,
  createMarker,
  getBoundsZoomLevel,
  centerCoordinates,
  constructBounds,
  getLandLordRequests,
  isInsideBounds,
  updateListingsByBounds,
  updateListingsByFilters
};
