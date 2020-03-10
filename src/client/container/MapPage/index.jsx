import React, { Component } from 'react'
import './index.css'
import MapView from "./MapView";
import ListView from "./ListView";
import Grid from "@material-ui/core/Grid";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box'
import ListingInfo from "./ListingInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Geocoder from 'react-native-geocoding';
Geocoder.init("AIzaSyCxRamqYhHGxnWvDIAzGBKuVpU-HCa-EHg");


class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            center: {
                lat:37.338207,
                lng:-121.886330
            },
            zoom: 9,
            labelStyle: {
                fontSize: 20
            },
            testList: [{"address":"793 Praderia Circle, Fremont, CA, 94539", "price":"1000 Per Month","duration":"12 Months","coordinates":{"lat":37.519200,"lng":-121.923760}},
                       {"address":"43349 Pacific Commons Blvd, Fremont, CA 94538", "price":"2500 Per Month","duration":"6 Months","coordinates":{"lat":37.503460,"lng":-121.972880}},
                       {"address":"1011 Pacific Ave, Santa Cruz, CA 95060", "price":"500 Per Month","duration":"3 Months","coordinates":{"lat":36.971300,"lng":-122.025610}},
                       {"address":"99 Grove St, San Francisco, CA 94102", "price":"2300 Per Month","duration":"8 Months","coordinates":{"lat":37.778080,"lng":-122.417320}},
                       {"address":"1417 R St, Sacramento, CA 95811", "price":"700 Per Month","duration":"6 Months","coordinates":{"lat":38.571850,"lng":-121.498627}},
                       {"address":"3333 Scott Blvd Santa Clara, CA 95054", "price":"5000 Per Month","duration":"12 Months","coordinates":{"lat":37.382439,"lng":-121.982117}},
                       {"address":"2610 Orchard Parkway San Jose , CA 95134", "price":"2100 Per Month","duration":"4 Months","coordinates":{"lat":37.385660,"lng":-121.931020}},
                       {"address":"665 W Jefferson Blvd, Los Angeles, CA 90007", "price":"4000 Per Month","duration":"21 Months","coordinates":{"lat":34.023987,"lng":-118.281273}},
                       {"address":"1 Amphitheatre Pkwy, Mountain View, CA 94043", "price":"200 Per Month","duration":"1 Month","coordinates":{"lat":37.426804,"lng":-122.080620}},
                       {"address":"886 Cannery Row, Monterey, CA 93940", "price":"500 Per Month","duration":"15 Months","coordinates":{"lat":36.618149,"lng":-121.901939}}],
            listing_info_opened: false,
            data: []
        };
        this.UpdateCenterFromChild = this.UpdateCenterFromChild.bind(this);
        this.ToggleListingInfoFromChild = this.ToggleListingInfoFromChild.bind(this);
        this.SmoothZoom = this.SmoothZoom.bind(this);
    }

    async getListInformation() {
        let listingsFormatted = [];
        let listings = await fetch('/getData')
            .then(data => data.json())
            .then(listings => {
                return listings
            });
        for (let listing of listings) {
            let listingFormatted = {...listing};
            let address = listing.location.street + ", " + listing.location.city + ", " + listing.location.state + ", " + listing.location.zipcode + ", " + listing.location.country;
            await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + "AIzaSyCxRamqYhHGxnWvDIAzGBKuVpU-HCa-EHg")
              .then((response) => response.json())
              .then((responseJson) => {
                  let coordinates = responseJson.results[0].geometry.location;
                  let lat = coordinates.lat;
                  let lng = coordinates.lng;
                  listingFormatted["address"] = address;
                  listingFormatted["coordinates"] = {"lat": lat, "lng": lng};
                  listingsFormatted.push(listingFormatted);
              });
        }
        return listingsFormatted;
    };

    componentDidMount() {

        console.log("Map page is called");

        this.getListInformation()
           .then(response => this.setState({data: response}));
    }

    // SmoothZoom(increment) {
    //     const {zoom} = this.state;
    //     let updateValue = increment ? 1 : -1; // Zoom in or out
    //     let zoomDestination = increment ? 15 : 9; // Animate to zoom 15 or 9.
    //     this.setState({
    //         zoom: zoom + updateValue
    //     });
    //     if ((zoom + updateValue) !== zoomDestination) {
    //         setTimeout(() => {
    //             this.SmoothZoom(increment);
    //         }, 100);
    //     }
    // }

    SmoothZoom() {
        const {zoom, listing_info_opened} = this.state;
        console.log("TEST",listing_info_opened);
        let zoomDestination = listing_info_opened ? 15 : 9; // Animate to zoom 15 or 9.
        let updateValue = Math.floor(zoom) < zoomDestination ? 1 : -1; // Zoom in or out
        this.setState({
            zoom: Math.floor(zoom) + updateValue
        }, () => {
            if (zoom !== zoomDestination) {
                setTimeout(() => {
                    this.SmoothZoom();
                }, 200);
            }
        });
    }

    UpdateCenterFromChild(lat, lng) {
        this.setState({
            center: {
                lat:lat,
                lng:lng
            }
        }, () => {
            const {center} = this.state;
            console.log("updated center",center);
            this.SmoothZoom();
        });
    }

    ToggleListingInfoFromChild(lat, lng){
        this.setState({
            listing_info_opened: !this.state.listing_info_opened,
            center: {
                lat:lat,
                lng:lng
            }
        }, () => {
            this.SmoothZoom();
        });
    }

    render() {
        const {center, zoom, labelStyle, listing_info_opened, data, testList} = this.state;
        console.log("compare data", data);
        console.log("compare testList", testList);
        return (
            <div>
                {data.length > 0 ? (
                    <Grid component="main">
                        <CssBaseline />
                        <Box className="App" component="div" display="flex" flexDirection="column">
                            <Grid container>
                                  <Grid item xs={4}>
                                      <ListView data={data} smoothZoom={this.SmoothZoom} updateCenter={this.UpdateCenterFromChild} toggleListingInfo={this.ToggleListingInfoFromChild}/>
                                </Grid>
                                <Grid item>
                                      <ListingInfo listing_info_opened={listing_info_opened} center={center} toggleListingInfo={this.ToggleListingInfoFromChild}/>
                                </Grid>
                                <Grid className="map" item xs={8}>
                                      <MapView center={center} zoom={zoom} labelStyle={labelStyle} data={data} smoothZoom={this.SmoothZoom} updateCenter={this.UpdateCenterFromChild} toggleListingInfo={this.ToggleListingInfoFromChild}/>
                                </Grid>
                             </Grid>
                       </Box>
                     </Grid>
                ) : (<div className='loader'/>)}
            </div>
        );
    }
}

export default LandingPage;
