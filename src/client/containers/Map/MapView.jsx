import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react'
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const wrapperStyles = {
    width: "100%",
    margin: "0 auto",
};

class MapView extends Component {
    constructor(props) {
        super(props);
    }

    handleOnClick(listing) {
        const {smoothZoom, updateCenter, toggleListingInfo} = this.props;
        toggleListingInfo(listing.coordinates.lat, listing.coordinates.lng);
        // updateCenter(listing);
        // console.log(listing);
        // smoothZoom(true);
    }

    render() {
        const {center, zoom} = this.props;

        const listingPins = this.props.testList.map((listing, index) => {
            if (listing.coordinates.lat === null || listing.coordinates.lng === null){
                return null
            } else{
                return <FontAwesomeIcon icon={faHome} size={"2x"} key={index} listing={listing}
                                        lat={listing.coordinates.lat} lng={listing.coordinates.lng}
                                        onClick={this.handleOnClick.bind(this,listing)} on/>
            }
        });

        return (
            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyCjAE2NzAApqOI4nmu7qEvhF2faRRCxsLs" }}
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

