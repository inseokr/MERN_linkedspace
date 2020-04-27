import React, { useContext, useEffect, useRef } from 'react';
import { ListingsContext } from "../../../../contexts/ListingsContext";

function Map() {
    const {center, zoom, data} = useContext(ListingsContext);
    console.log("DATA", center, zoom, data);
    const googleMapRef = useRef(null);
    let googleMap = null;

    useEffect(() => {
        googleMap = initGoogleMap(center, zoom);
        if (data.length > 0) {
            let bounds = new window.google.maps.LatLngBounds();
            data.map(listing => {
                const coordinates = listing.rental_property_information.coordinates;
                const mapParameters = {
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    icon: "/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg"
                };
                const marker = createMarker(mapParameters);
                bounds.extend(marker.position);
            });
            // console.log("googleMap.getBounds(bounds);", googleMap.getBounds(bounds));
            googleMap.fitBounds(bounds); // the map to contain all markers
        }
    }, []);

    const initGoogleMap = (center, zoom) => { // Initialize the google map
        return new window.google.maps.Map(googleMapRef.current, {
            center: center,
            zoom: zoom
        });
    };

    const createMarker = (markerObj) => new window.google.maps.Marker({ // Create marker on google map
        position: { lat: markerObj.lat, lng: markerObj.lng },
        map: googleMap,
        icon: {
            url: markerObj.icon,
            scaledSize: new window.google.maps.Size(50, 50)
        }
    });

    return <div ref={googleMapRef} style={{height: '100vh', width: '100%'}}/>;
}

export default Map;
