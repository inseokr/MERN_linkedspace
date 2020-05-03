import React, { createContext, useEffect, useState } from 'react';

export const ListingsContext = createContext();

export function ListingsProvider(props) {

    const [data, setData] = useState([]);
    const [center, setCenter] = useState({lat:37.338207, lng:-121.886330});
    const [zoom, setZoom] = useState(9);

    async function getListInformation() {
        let listingsFormatted = [];
        let listings = await fetch('/getData')
            .then(data => data.json())
            .then(listings => {
                console.log("getListInformation", listings);
                return listings
            });
        for (let listing of listings) {
            let listingFormatted = {...listing};
            let location = listing.rental_property_information.location;
            let address = listing.rental_property_information.location.street + ", " + location.city + ", " + location.state + ", " + location.zipcode + ", " + location.country;
            await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + "AIzaSyDFmEEQH0IlODaZN6Tq9euWxDLd1WyYVt8")
                .then((response) => response.json())
                .then((responseJson) => {
                    let coordinates = responseJson.results[0].geometry.location;
                    let lat = coordinates.lat;
                    let lng = coordinates.lng;
                    listingFormatted.rental_property_information.address = address;
                    listingFormatted.rental_property_information.coordinates = {"lat": lat, "lng": lng};
                    listingsFormatted.push(listingFormatted);
                });
        }
        return listingsFormatted;
    }

    useEffect(() => {
        getListInformation()
          .then(response => setData(response));
    }, []);

    return (
      <ListingsContext.Provider value={{ data, center, zoom }}>
          {props.children}
      </ListingsContext.Provider>
    );
}
