import React, { Component, createContext } from "react";

export const ListingsContext = createContext();

export class ListingsProvider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            center: {
                lat:37.338207,
                lng:-121.886330
            },
            zoom: 9
        };
        // this.changeLanguage = this.changeLanguage.bind(this);
    }
    // changeLanguage(e) {
    //     this.setState({ language: e.target.value });
    // }

    async getListInformation() {
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
            await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + "AIzaSyA0xwOTN9Sl9aLninaOtIapMvsCo8JMU-I")
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
    };

    componentDidMount() {
        // const {search} = this.context;
        // console.log("MapPage is loaded. search = " + search);
        this.getListInformation()
            .then(response => this.setState({data: response}));
    }

    render() {
        return (
            <ListingsContext.Provider value={{ ...this.state }}>
                {this.props.children}
            </ListingsContext.Provider>
        );
    }
}

export const withListingsContext = Component => props => (
    <ListingsContext.Consumer>
        {value => <Component listingsContext={value} {...props} />}
    </ListingsContext.Consumer>
);
