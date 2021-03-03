/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import '../../../app.css';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import ListingCoverPage from './ListingCoverPage';
import ListingIntro from './ListingIntro';
import LocationInfo from './LocationInfo';
import ExploreHome from './ExploreHome';
import HomeDetails from './HomeDetails';
import ListingControlButtons from './ListingControlButtons';

function ListingLandlordMainPage(props) {
  const { fetchCurrentListing } = useContext(CurrentListingContext);
  const { match } = props;

  const [listingFetched, setListingFetched] = useState(false);

  useEffect(() => {
    if (!listingFetched && match) { // Continue if listing not fetched and match prop isn't undefined.
      const { params } = match;
      if (params) {
        const { id } = params;
        if (id.length > 0) {
          fetchCurrentListing(id, 'landlord').then(response => {
            setListingFetched(!!(response));
          });
        }
      }
    }
  }, [match]);

  return (
    <div>
      {
        listingFetched ? (
          <div>
            <ListingCoverPage />
            <div className="container no_border" style={{ marginTop: '20px' }}>
              <ListingIntro />
              <ListingControlButtons />
              <LocationInfo />
              <ExploreHome />
              <HomeDetails />
            </div>
          </div>
        ) : (<div className="loader"/>)
      }
    </div>
  );
}

export default ListingLandlordMainPage;
