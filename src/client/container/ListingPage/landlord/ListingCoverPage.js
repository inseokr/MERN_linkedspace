/* eslint-disable */
import React, { useContext } from 'react';
import '../../../app.css';
import {FILE_SERVER_URL} from '../../../globalConstants';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';

function ListingCoverPage() {
  const { currentListing } = useContext(CurrentListingContext);

  const listingCaption = (currentListing.listing.num_of_pictures_uploaded > 0)
    ? currentListing.listing.pictures[0].caption : '';
  const listingImage = 	 (currentListing.listing.num_of_pictures_uploaded > 0)
		    				? (
  <img
    src={FILE_SERVER_URL+currentListing.listing.pictures[0].path}
    align="right"
    style={{
      width: '100%', maxHeight: '100%', objectFit: ' cover', objectPosition: '100% 70%'
    }}
    alt="listingImage"
  />
    ) : '';

  return (
    <div className="row no_border">
      <div className="col-3 wooden_background no_border" style={{ height: ' 500px', marginLeft: ' 30px', backgroundColor: '#f2f2f2' }}>
        <div className="listingCoverLogo"> LinkedSpaces </div>
        <div style={{ marginTop: '20px' }}>
          <div className="show_title">
            BEAUTIFUL HOME IN
            {currentListing.listing.rental_property_information.location.city.toUpperCase()}
          </div>
        </div>

        <div style={{ marginTop: '4px' }}>
          <div>
            <span className="rating">
              <span role="img" aria-label="Rating 5 out of 5">
                <span className="_13wa7798">
                  <svg
                    viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" style={{
                    height: '1em', width: '1em', display: 'block', fill: 'currentColor'
                  }}
                  >
                    <path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z" />
                  </svg>
                </span>
                <span className="_13wa7798">
                  <svg
                    viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" style={{
                    height: '1em', width: '1em', display: 'block', fill: 'currentColor'
                  }}
                  >
                    <path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z" />
                  </svg>
                </span>
                <span className="_13wa7798">
                  <svg
                    viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" style={{
                    height: '1em', width: '1em', display: 'block', fill: 'currentColor'
                  }}
                  >
                    <path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z" />
                  </svg>
                </span>
                <span className="_13wa7798">
                  <svg
                    viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" style={{
                    height: '1em', width: '1em', display: 'block', fill: 'currentColor'
                  }}
                  >
                    <path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z" />
                  </svg>
                </span>
                <span className="_13wa7798">
                  <svg
                    viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" style={{
                    height: '1em', width: '1em', display: 'block', fill: 'currentColor'
                  }}
                  >
                    <path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z" />
                  </svg>
                </span>
              </span>
            </span>
            <span className="_1m8bb6v">229 reviews</span>
            <span className="_1gvnvab" aria-hidden="true">
              <span className="_so3dpm2">229</span>
            </span>
          </div>

          <div style={{ marginTop: '32px' }}>
            <span className="_1xzp5ma3">
              {listingCaption}
            </span>
          </div>

        </div>
      </div>

      <div className="col-8 no_border" style={{ borderStyle: 'none !important', height: '500px', marginLeft: '30px' }}>
        {listingImage}
      </div>
    </div>
  );
}

export default ListingCoverPage;
