import React, { useContext, useEffect, useRef } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import { constructBounds, centerCoordinates } from '../../../../contexts/helper/helper';

import './Map.css';

function Map() {
    const {filteredListings, mapParams, setMapParams, createMarker} = useContext(ListingsContext);

    const googleMapRef = useRef(null);
    let googleMap = null;

    useEffect(() => {
        googleMap = new window.google.maps.Map(googleMapRef.current, {zoom: mapParams["zoom"], center: mapParams["center"], mapTypeControl: false, streetViewControl: false});

        googleMap.addListener('dragend', function () {
            const idleListener = googleMap.addListener('idle', function () {
                window.google.maps.event.removeListener(idleListener);
                setMapParams({"bounds": constructBounds(googleMap.getBounds()), "center": centerCoordinates(googleMap.getCenter()), "zoom": googleMap.getZoom()});
            });
        });

        googleMap.addListener('zoom_changed', function () {
            const idleListener = googleMap.addListener('idle', function () {
                window.google.maps.event.removeListener(idleListener);
                setMapParams({"bounds": constructBounds(googleMap.getBounds()), "center": centerCoordinates(googleMap.getCenter()), "zoom": googleMap.getZoom()});
            });
        });

        const bounds = new window.google.maps.LatLngBounds();
        filteredListings.map(listing => {
            const coordinates = listing.rental_property_information.coordinates;
            const image = listing.pictures.length > 0 ? listing.pictures[0]["path"] : "/public/user_resources/pictures/5cac12212db2bf74d8a7b3c2_1.jpg";
            const marker = createMarker(googleMap, coordinates, image);
            marker.addListener("click", () => {
                alert("Clicked!");
            });
            bounds.extend(coordinates);
        });
    }, [filteredListings]);

    return <div id="mapView" ref={googleMapRef} style={{height: '100vh'}}/>;
}

export default Map;
