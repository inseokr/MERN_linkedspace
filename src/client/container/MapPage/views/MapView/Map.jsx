import React, { useContext, useEffect, useRef } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import createHTMLMapMarker from './createHTMLMapMarker';
import './Map.css';

function Map() {
    const {center, zoom, data} = useContext(ListingsContext);
    console.log("DATA", center, zoom, data);
    const googleMapRef = useRef(null);
    let googleMap = null;

    useEffect(() => {
        const mapOptions = {
          zoom: zoom,
          center: center
        };
        googleMap = initGoogleMap(mapOptions);
        if (data.length > 0) {
            let bounds = new window.google.maps.LatLngBounds();
            data.map(listing => {
                const coordinates = listing.rental_property_information.coordinates;
                const marker = createMarker(coordinates);
                console.log("um", marker.getPosition);
                bounds.extend(coordinates);
            });
            // console.log("googleMap.getBounds(bounds);", googleMap.getBounds(bounds));
            // googleMap.fitBounds(bounds); // the map to contain all markers
        }
    }, []);

    const initGoogleMap = (mapOptions) => { // Initialize the google map
        return new window.google.maps.Map(googleMapRef.current, mapOptions);
    };

    const createMarker = (coordinates) => {
        const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
        let marker = createHTMLMapMarker({
            latlng: latLng,
            map: googleMap,
            html: `<img id="marker" src="/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg">`
        });
        marker.addListener('click', () => alert("CLICKED!"));
        return marker;
    };

    return <div ref={googleMapRef} style={{height: '100vh', width: '100%'}}/>;
}

export default Map;
