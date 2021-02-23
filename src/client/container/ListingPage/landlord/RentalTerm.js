import React, { useContext } from 'react';
import '../../../app.css';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';


function RentalTerm() {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div>
      <hr />
      <div className="_1xzp5ma3" style={{ marginTop: '40px' }}>
        Rental terms
      </div>

      <div className="no_border" style={{ marginTop: '20px' }}>
        <div className="row shadowedTile" style={{ paddingTop: '8px' }}>
          <div className="col-4">
            <ul>
              <li>
                {' '}
                Asking Price:
                {currentListing.listing.rental_terms.asking_price}
              </li>
              <li>
                {' '}
                Security Deposit:
                {currentListing.listing.rental_terms.security_deposit}
              </li>
            </ul>
          </div>

          <div className="col-6">
            <ul>
              <li>
                {' '}
                Rental Duration:
                {currentListing.listing.rental_terms.duration}
                {' '}
                months
              </li>
              <li>
                {' '}
                Move-in available date: from
                {currentListing.listing.move_in_date.month}
                /
                {currentListing.listing.move_in_date.date}
                /
                {currentListing.listing.move_in_date.year}
              </li>
            </ul>
          </div>
        </div>
      </div>
      {' '}
      {/* Rental terms */}
    </div>
  );
}

export default RentalTerm;
