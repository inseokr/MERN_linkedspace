import React, { Component } from 'react';
import ListItem from '@material-ui/core/ListItem';
import Carousel from 'react-bootstrap/Carousel'
import { Paper, Grid, Typography } from '@material-ui/core';
import './ListingComponent.css';
import Divider from '@material-ui/core/Divider';
import constructListingInformationBullets from '../../helper/helper';

class ListingComponent extends Component {

    constructor() {
        super();
        this.state = {
            index: 0
        }
    }

    handleSelect = e => {
        this.setState({index: e});
    };

    render() {
        const {index} = this.state;
        const {listing} = this.props;

        const listingTitle = listing.rental_property_information.room_type + " " + listing.rental_property_information.unit_type;
        const listingAmenities = constructListingInformationBullets(listing.amenities);
        const listingAccessibleSpaces = constructListingInformationBullets(listing.accessible_spaces);

        return (
            <ListItem>
                <Grid container>
                    <Grid item xs={4}>
                        <Carousel interval={false} slide={true} activeIndex={index} onSelect={this.handleSelect} className={"carousel"}>
                            {listing.pictures.map(function (picture) {
                                return (
                                    <Carousel.Item>
                                        <img src={picture.path} alt={picture.caption}/>
                                    </Carousel.Item>
                                )
                            })}
                        </Carousel>
                    </Grid>
                    <Grid item xs={8}>
                        <Paper className={"description"}>
                            <Typography className={"description__title"} color={"textSecondary"} gutterBottom>
                                {listingTitle}
                            </Typography>
                            <Typography className={"description__address"}>
                                {listing.rental_property_information.address}
                            </Typography>
                            {listingAmenities.length > 0 ? (
                                <Typography className={"description__bullets"} color={"textSecondary"} gutterBottom>
                                    {listingAmenities}
                                </Typography>
                            ) : (<></>)}
                            {listingAccessibleSpaces.length > 0 ? (
                                <Typography className={"description__bullets"} color={"textSecondary"} gutterBottom>
                                    {listingAccessibleSpaces}
                                </Typography>
                            ) : (<></>)}
                        </Paper>
                    </Grid>
                </Grid>
            </ListItem>
        );
    }
}

export default ListingComponent;
