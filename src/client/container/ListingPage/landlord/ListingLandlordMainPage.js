import React, { Component, useEffect, createContext, useContext } from 'react';
import '../../../app.css';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import ListingCoverPage from './ListingCoverPage'
import ListingIntro from './ListingIntro'
import LocationInfo from './LocationInfo'
import ExploreHome from './ExploreHome'
import HomeDetails from './HomeDetails'
import RentalTerm from './RentalTerm'
import HostDetails from './HostDetails'
import ListingControlButtons from './ListingControlButtons'
// list of components

export default class ListingLandlordMainPage extends Component {
    static contextType = CurrentListingContext;

    constructor(props) {
        super(props);

        console.log("props = " + JSON.stringify(props));
    }

    componentDidMount() {
        console.log("ListingLandlordMainPage: componentDidMount")
        
        if(this.props.match!=undefined)
            this.context.fetchCurrentListing(this.props.match.params.id);
    }

    componentWillMount() {

        console.log("ListingLandlordMainPage: componentWillMount");
        /* load listing information by listing ID */
        // <note> this parameter will contain the value of ":id" in the followinng route path 
        // /listing/landlord/:id
        //this.context.fetchCurrentListing(this.props.match.params.id);
    }

/* 
                <ListingCoverPage />
                <ListingIntro />
                <LocationInfo />
                <ExploreHome />
                <HomeDetails />
                <RentalTerm />
                <HostDetails />
                <ListingControlButtons />
                */
    render() {

        if(this.context.listing_info==undefined)
        {
            return (<> </>)
        }

        // ISEO-TBD: not sure how to match it?
        let footer = ""    
        return (
            <>
                <ListingCoverPage />
                <div className="container no_border" style={{marginTop:"20px"}}>
                <ListingIntro />
                <LocationInfo />
                <ExploreHome />
                <HomeDetails />
                <RentalTerm />
                <HostDetails />
                <ListingControlButtons />
                </div>
                {footer}
            </>

        );
    }
}
