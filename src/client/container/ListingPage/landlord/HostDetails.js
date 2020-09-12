import React, { useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";


function HostDetails() {
  const {currentListing} = useContext(CurrentListingContext);

  return (
    <div>
      <hr/>
      <div className="_1xzp5ma3" style={{marginTop:"40px"}}>
        Interested in this property?
      </div>

      <div className="row no_border" style={{marginTop:"30px"}}>
        <div className="col-3">
          <img src={currentListing.listing.requester.id.profile_picture} className="center rounded-circle" style={{width:"100%", maxHeight:"100%", marginLeft:"25px"}} alt="profilePicture"/>
        </div>

        <div className="col-4 _1ezjrwzo" style={{marginLeft:"50px"}}>
          Hello there,
          <br/>
          My name is In Seo who's working at one of high-tech company in Silicon Valley.
          <br/>
          <br/>
          I'm currently looking for a tenant for one of my extra room which has private entrance, and very private.
          You could share the living room and kitchen as well.
          <br/>
          <br/>
          Read more...

        </div>

        <div className="col-lg-4 sub_title wooden_background  rounded-top rounded-bottom" style={{maxHeight:"102px",textAlign:"center"}}>
          <div style={{marginTop:"10px"}}>Contact</div>
          <div className="sub_title" style={{marginTop:"10px !important"}}>
            <ul  style={{listStyleType:"none"}}>
              <li> Phone Number: {currentListing.listing.contact.phone} </li>
              <li id="email"> E-mail: {currentListing.listing.contact.email} </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostDetails
