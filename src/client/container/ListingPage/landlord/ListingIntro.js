/* eslint-disable */
import React, { useContext } from 'react';
import '../../../app.css';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { FILE_SERVER_URL } from '../../../globalConstants';

function ListingIntro() {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div className="row">
      <div className="col-7">
        <div className="_lsFont1">
          {currentListing.listing.num_of_total_guests}
          {' '}
          Guest(s)
          {' '}
          {currentListing.listing.num_of_bedrooms}
          {' '}
          bedroom
          {' '}
          {currentListing.listing.num_of_total_baths}
          {' '}
          bath
        </div>

        <div className="_lsFont2" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>
          {currentListing.listing.summary_of_listing}
        </div>
      </div>

      <div className="col-4" style={{ display: 'flex', flexDirection: 'row', marginLeft: '10px' }}>
        <div style={{minWidth: '100px'}}>
          <div className="_lsFont1">
            Hosted by
            <br></br>
            {`${currentListing.listing.requester.firstname} ${currentListing.listing.requester.lastname}`}
          </div>
          <div style={{ maxWidth: '100px', marginTop: '20px' }}>
            <img src={FILE_SERVER_URL+currentListing.listing.requester.profile_picture} className="center rounded-circle" style={{ width: '100%', maxHeight: '100%' }} />
          </div>
          <div style={{ marginLeft: '30px' }}>
            <span className="rating">
              <span role="img" aria-label="distance">
                <span className="_13wa7798">
                  <svg
                    viewBox="0 0 1000 1000"
                    role="presentation"
                    aria-hidden="true"
                    focusable="false"
                    style={{
                    height: '1em', width: '1em', display: 'block', fill: 'currentColor'
                  }}
                  >
                    <path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z" />
                  </svg>
                </span>
              </span>
            </span>

            <span className="_1m8bb6v">1st</span>
            <span className="_1gvnvab" aria-hidden="true">
              <span className="_so3dpm2">1st</span>
            </span>
          </div>
        </div>

        <div className="shadowedTile"
          style={{
                  maxHeight: '120px',
                  width: 'auto',
                  textAlign: 'left',
                  marginLeft: '45px',
                  marginTop: '45px' }}>
          <div className="_lsFont1" style={{ marginTop: '-10px' }}>Contact</div>
          <hr/>
          <div style={{ dislay: 'flex', marginTop: '10px' }}>
              <section style={{textAlign: 'left', display: 'flex'}}>
                <svg style={{height: '20px', width: '20px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="mobile-alt" className="svg-inline--fa fa-mobile-alt fa-w-10" role="img" viewBox="0 0 320 512"><path fill="currentColor" d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm112-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z"/>
                </svg>
                <section className="_lsFont2">{currentListing.listing.contact.phone}</section>
              </section>
              <section style={{textAlign: 'left', display: 'flex'}}>
                <svg style={{height: '18px', width: '18px', marginLeft: '3px'}} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="far" data-icon="envelope" className="svg-inline--fa fa-envelope fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z"/>
                </svg>
                <section className="_lsFont2">{currentListing.listing.contact.email}</section>
              </section>
          </div>
        </div>

      </div>
    </div>
  );
}
export default ListingIntro;
