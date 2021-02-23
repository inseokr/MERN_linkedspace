/* eslint-disable */
import React, { useContext } from 'react';
import '../../../app.css';
import {FILE_SERVER_URL} from '../../../globalConstants';
import '../common/listing_style.css';
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';


function HostDetails() {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div>
      <hr />
      <div className="_1xzp5ma3" style={{ marginTop: '40px' }}>
        Interested in this property?
      </div>

      <div className="row no_border" style={{ marginTop: '30px' }}>
        <div className="col-3">
          <img src={FILE_SERVER_URL+currentListing.listing.requester.profile_picture} className="center rounded-circle" style={{ width: '100%', maxHeight: '100%', marginLeft: '25px' }} alt="profilePicture" />
        </div>

        <div className="col-4 _1ezjrwzo" style={{ marginLeft: '50px' }}>
          Hello there,
          <br />
          My name is In Seo who's working at one of high-tech company in Silicon Valley.
          <br />
          <br />
          I'm currently looking for a tenant for one of my extra room which has private entrance, and very private.
          You could share the living room and kitchen as well.
          <br />
          <br />
          Read more...

        </div>

        <div className="col-lg-4 shadowedTile" style={{ maxHeight: '120px', textAlign: 'left', marginLeft: '45px' }}>
          <div className="_lsFont1" style={{ marginTop: '-15px' }}>Contact Information</div>
          <hr/>
          <div style={{ dislay: 'flex', marginTop: '10px' }}>
              <section style={{textAlign: 'left', display: 'flex'}}> 
                <section className="_lsFont1"> Phone Number:{' '}</section> 
                <section className="_lsFont2">{currentListing.listing.contact.phone}</section>
              </section>
              <section style={{textAlign: 'left', display: 'flex'}}> 
                <section className="_lsFont1"> E-mail:{' '}</section> 
                <section className="_lsFont2">{currentListing.listing.contact.email}</section>
              </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostDetails;
