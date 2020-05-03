import React, { useContext, useState, useEffect } from 'react';
import Map from './Map'

const GOOGLE_MAP_API_KEY = 'AIzaSyDFmEEQH0IlODaZN6Tq9euWxDLd1WyYVt8';

function loadGoogleMapScript(callback) { // Load the google map script
    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
        callback();
    } else {
        const googleMapScript = document.createElement("script");
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}`;
        window.document.body.appendChild(googleMapScript);
        googleMapScript.addEventListener("load", callback);
    }
}

function InitiateMap(props) {
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        loadGoogleMapScript(() => {
            setMapLoaded(true)
        });
    }, []);

    return (
        <div className="App">
            {mapLoaded ? <Map/> : <div>Loading...</div>}
        </div>
    );
}

export default InitiateMap;
