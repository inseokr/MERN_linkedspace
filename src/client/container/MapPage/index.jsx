import React, { Component } from 'react'
import './index.css'
import InitiateMap from "./views/MapView/InitiateMap";
import ListView from "./ListView";
import ListView2 from "./views/ListView/ListView";
import ListingInfo from "./ListingInfo";
import Grid from "@material-ui/core/Grid";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { ListingsContext } from '../../contexts/ListingsContext';

class LandingPage extends Component {
    static contextType = ListingsContext;
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
            listing_info_opened: false,
            data: []
        };
        this.UpdateCenterFromChild = this.UpdateCenterFromChild.bind(this);
        this.ToggleListingInfoFromChild = this.ToggleListingInfoFromChild.bind(this);
        this.SmoothZoom = this.SmoothZoom.bind(this);
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
        const {listing_info_opened} = this.state;
        return (
            <div>
                <Grid component="main">
                    <CssBaseline />
                    <Box className="App" component="div" display="flex" flexDirection="column">
                        <Grid container>
                            <Grid item xs={6}>
                                {/*<ListView2 data={data} smoothZoom={this.SmoothZoom} updateCenter={this.UpdateCenterFromChild} toggleListingInfo={this.ToggleListingInfoFromChild}/>*/}
                            </Grid>
                            <Grid item>
                                {/*<ListingInfo listing_info_opened={listing_info_opened} center={center} toggleListingInfo={this.ToggleListingInfoFromChild}/>*/}
                            </Grid>
                            <Grid className="map" item xs={6}>
                                <InitiateMap/>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                {/*{data.length > 0 ? (*/}
                {/*    <Grid component="main">*/}
                {/*        <CssBaseline />*/}
                {/*        <Box className="App" component="div" display="flex" flexDirection="column">*/}
                {/*            <Grid container>*/}
                {/*                <Grid item xs={6}>*/}
                {/*                    /!*<ListView2 data={data} smoothZoom={this.SmoothZoom} updateCenter={this.UpdateCenterFromChild} toggleListingInfo={this.ToggleListingInfoFromChild}/>*!/*/}
                {/*                </Grid>*/}
                {/*                <Grid item>*/}
                {/*                    /!*<ListingInfo listing_info_opened={listing_info_opened} center={center} toggleListingInfo={this.ToggleListingInfoFromChild}/>*!/*/}
                {/*                </Grid>*/}
                {/*                <Grid className="map" item xs={6}>*/}
                {/*                    <InitiateMap smoothZoom={this.SmoothZoom} updateCenter={this.UpdateCenterFromChild} toggleListingInfo={this.ToggleListingInfoFromChild}/>*/}
                {/*                </Grid>*/}
                {/*            </Grid>*/}
                {/*        </Box>*/}
                {/*    </Grid>*/}
                {/*) : (<div className='loader'/>)}*/}
            </div>
        );
    }
}

export default LandingPage;
