import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react'
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import list from 'less/lib/less/functions/list';
import Geocoder from 'react-native-geocoding';
Geocoder.init("AIzaSyAz5LGq4rf38Sav2MY_H9Nzl4aGm45jz3E");

const wrapperStyles = {
    width: "100%",
    margin: "0 auto",
};

class MapView extends Component {
    constructor(props) {
        super();
    }

    handleOnClick(listing) {
        const {smoothZoom, updateCenter, toggleListingInfo} = this.props;
        let lat = listing.coordinates.lat || null;
        let lng = listing.coordinates.lng || null;
        if (lat !== null || lng !== null) {
            toggleListingInfo(lat, lng);
        }
        // updateCenter(listing);
        // console.log(listing);
        // smoothZoom(true);
    }

  // async getCoordinates() {
  //   const {center, zoom, data} = this.props;
  // };
  //
  // componentDidMount() {
  //   this.getCoordinates()
  //     .then(r => console.log("TESTING getCoordinates:", r));
  // }

    render() {
        const {center, zoom, data} = this.props;

        const listingPins = data.map((listing, index) => {
          console.log("listingPins", listing);
          let coordinates = listing.coordinates || {};
          let lat = coordinates.lat || null;
          let lng = coordinates.lng || null;
          if (lat === null || lng === null) {
            return null
          } else {
            console.log("FontAwesomeIcon", lat, lng);
            return <FontAwesomeIcon icon={faHome} size={"2x"} key={index} listing={listing}
                                    lat={lat} lng={lng}
                                    onClick={this.handleOnClick.bind(this,listing)} on/>
          }
        });

        return (
            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyAz5LGq4rf38Sav2MY_H9Nzl4aGm45jz3E" }}
                    center={center}
                    zoom={zoom}
                >
                    {listingPins}
                </GoogleMapReact>
            </div>
        );
    }
}

export default MapView;

