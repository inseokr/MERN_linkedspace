/* eslint-disable */
import React, { Component } from 'react';
import '../../../app.css';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import ListingCoverPage from './ListingCoverPage';
import ListingIntro from './ListingIntro';
import LocationInfo from './LocationInfo';
import ExploreHome from './ExploreHome';
import HomeDetails from './HomeDetails';
import RentalTerm from './RentalTerm';
import HostDetails from './HostDetails';
import ListingControlButtons from './ListingControlButtons';
// list of components

export default class ListingLandlordMainPage extends Component {
  static contextType = CurrentListingContext;

  constructor(props) {
    super(props);
    console.log(`props = ${JSON.stringify(props)}`);
  }

  componentDidMount() {
    console.log('ListingLandlordMainPage: componentDidMount');

    if (this.props.match !== undefined) this.context.fetchCurrentListing(this.props.match.params.id, 'landlord');
  }

  componentWillMount() {
    console.log('ListingLandlordMainPage: componentWillMount');
    /* load listing information by listing ID */
    // <note> this parameter will contain the value of ":id" in the following route path
    // /listing/landlord/:id
    // this.context.fetchCurrentListing(this.props.match.params.id);
    // if(this.props.match!==undefined)
    //  this.context.fetchCurrentListing(this.props.match.params.id, "landlord");
  }

  render() {
    const footer = '';

    if (this.context.currentListing !== undefined) {
      console.log(`currentListing = ${JSON.stringify(this.context.currentListing)}`);
      if (this.context.currentListing.listing === undefined) {
        // need to load it again.
        this.context.fetchCurrentListing(this.props.match.params.id);
        return (
          <div />
        );
      }
    } else {
      console.log('currentListing is not defined');
    }

    return (
      <div>
        {
          (this.context.currentListing && this.context.currentListing.listing.listingType === 'landlord') ? (
            <div>
              <ListingCoverPage />
              <div className="container no_border" style={{ marginTop: '20px' }}>
                <ListingIntro />
                <ListingControlButtons />
                <LocationInfo />
                <ExploreHome />
                <HomeDetails />
                <HostDetails />
              </div>
              {footer}
            </div>
          ) : (<div />)
        }
      </div>
    );
  }
}
