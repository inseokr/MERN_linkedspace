/* eslint-disable */
import React, { useContext } from 'react';
import '../../../app.css';
import {FILE_SERVER_URL} from '../../../globalConstants';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';

function getListingPictures(listing_info) {
  const pictures = [];

  try {
    for (let picIndex = 1; picIndex < listing_info.listing.num_of_pictures_uploaded; ++picIndex) {
      const picture = (
        <div className="col-3">
          <div className=" thumbnail" style={{ backgroundColor: '#f2f2f2' }}>
            <img
              className="img-responsive"
              src={FILE_SERVER_URL+listing_info.listing.pictures[picIndex].path}
              alt="listingPicture"
            />
            <div className="caption-full ">
              <section className="_lsFont2" style={{textAlign: 'center'}}> {listing_info.listing.pictures[picIndex].caption} </section>
              <p />
            </div>
          </div>
        </div>
      );

      pictures.push(picture);
    }

    return pictures;
  } catch (err) {
    console.warn(err);
    return [];
  }
}

function ExploreHome() {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div>
      <hr />
      <div className="_lsFont1" style={{textAlign: 'center'}}>
        Explore the house
      </div>

      <div className="row no_border">
        {getListingPictures(currentListing)}
      </div>
      <hr />
    </div>
  );
}

export default ExploreHome;
