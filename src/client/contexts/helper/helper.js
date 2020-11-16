import createHTMLMapMarker from './createHTMLMapMarker';

const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

function loadGoogleMapScript(callback) { // Load the google map script.
    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
        callback();
    } else {
        const googleMapScript = document.createElement("script");
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}`;
        window.document.body.appendChild(googleMapScript);
        googleMapScript.addEventListener("load", callback);
    }
}

function getGeometryFromSearchString(search) { // Get geometry from google API.
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${GOOGLE_MAP_API_KEY}`).then((response) => {
        return response.json()
    });
}

function createMarker(googleMap, coordinates, imgSource, marker_selected) { // Construct a marker using createHTMLMapMarker
    const latLng = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
    const _html = (marker_selected === true) ? `<img id="marker_selected" class="bounce" src="${imgSource}" alt="Selected Marker">`: `<img id="marker_default" class="bounce" src="${imgSource}" alt="Default Marker">`;
    console.log("createMarker", coordinates, marker_selected);
    return createHTMLMapMarker({
        latlng: latLng,
        map: googleMap,
        html: _html
    });
}

function getBoundsZoomLevel(bounds, mapDim) { // Get the zoom for a given bound.
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

function centerCoordinates(center) { // Construct center object.
    return {lat: center.lat(), lng: center.lng()}
}

function constructBounds(bounds) { // Construct the correct bounds object to use.
    const [northeast, southwest] = Object.keys(bounds);
    return {"northeast": {"lat": bounds[northeast]["j"] || 37.5, "lng": bounds[southwest]["j"] || -121.9}, "southwest": {"lat": bounds[northeast]["i"] || 37.5, "lng": bounds[southwest]["i"] || -122}}
}

async function getLandLordRequests() {
    const listings = await fetch('/getData').then(data => {
        return data.json()
    });

    for (let i = 0; i < listings.length; i++) {
        const location = listings[i].rental_property_information.location;
        const address = listings[i].rental_property_information.location.street + ", " + location.city + ", " + location.state + ", " + location.zipcode + ", " + location.country;

        const geometry = await getGeometryFromSearchString(address);
        const coordinates = geometry.results[0].geometry.location;

        listings[i].rental_property_information.address = address;
        listings[i].rental_property_information.coordinates = {"lat": coordinates.lat, "lng": coordinates.lng};
    }

    return listings;
}

function isInsideBounds(coordinates, northeast, southwest) { // Function to check if coordinates within bounds.
    const normalizeDegrees = v => v < 0 ? 360 + v % 360 : v % 360;
    return southwest.lat < coordinates.lat &&
        northeast.lat > coordinates.lat &&
        normalizeDegrees(coordinates.lng - southwest.lng) < normalizeDegrees(northeast.lng - southwest.lng)
}

function updateListingsByBounds(listings, bounds) {
    let filteredListings = [];
    for (let listing of listings) {
        if (isInsideBounds(listing.rental_property_information.coordinates, bounds.northeast, bounds.southwest)) {
            filteredListings.push(listing);
        }
    }

    return filteredListings
}

function updateListingsByFilters(mapElementID, listings, filterParams, zoom) {
    let filteredListings = [];

    let geometry = {};
    getGeometryFromSearchString(filterParams["search"]).then(response => {
            if (response.status === "OK") {
                geometry = response.results[0].geometry
            } else {
                geometry = {}
            }
        }
    );

    let boundParams = {"bounds": geometry.viewport, "center": geometry.location, "zoom": zoom};
    if (Object.keys(geometry).length > 0) { // Continue if geometry was fetched.
        if (document.getElementById(mapElementID)) { // Continue if element exists.
            const mapViewProperties = document.getElementById(mapElementID).getBoundingClientRect();
            boundParams = {"bounds": geometry.viewport, "center": geometry.location, "zoom": getBoundsZoomLevel(geometry.viewport, {height: mapViewProperties.height, width: mapViewProperties.width})};
        }
    }

    for (let listing of listings) {
        if (filterParams["places"][listing.rental_property_information.room_type]) {
            let askingPrice = listing.rental_terms.asking_price;
            const price = filterParams["price"];
            const min = price[0];
            const max = price[1];
            if ((askingPrice >= min && askingPrice <= max) || askingPrice > 1000) {
                if (boundParams["bounds"] && boundParams["center"]) {
                    if (isInsideBounds(listing.rental_property_information.coordinates, boundParams["center"].northeast, boundParams["center"].southwest)) {
                        filteredListings.push(listing);
                    }
                } else {
                    filteredListings.push(listing);
                }
            }
        }
    }

    return filteredListings
}

export { loadGoogleMapScript, getGeometryFromSearchString, createMarker, getBoundsZoomLevel, centerCoordinates, constructBounds, getLandLordRequests, isInsideBounds, updateListingsByBounds, updateListingsByFilters };
