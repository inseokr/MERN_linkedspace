/* eslint-disable */
import React, { useContext } from 'react';
import '../../../app.css';
import '../common/listing_style.css';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import FormatListItems from '../../../components/decos/FormatListItems';

function HomeDetails() {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div>
      <div className="_lsFont1" style={{textAlign: 'center'}}>
        Amenities available to you
      </div>

      {/* Available Amenities */}
      <div style={{ marginTop: '20px' }}>
        <div className="row shadowedTile">
          {FormatListItems(currentListing.availableAmenities, 3)}
        </div>
      </div>

      <hr />

      <div className="_lsFont1" style={{textAlign: 'center'}}>
        Available facilities
      </div>

      <div style={{ marginTop: '20px' }}>
        <div className="row shadowedTile">
          {FormatListItems(currentListing.accessibleSpaces, 2)}
        </div>
      </div>

    </div>
  );
}

export default HomeDetails;
