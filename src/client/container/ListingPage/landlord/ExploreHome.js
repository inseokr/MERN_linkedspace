import React, {useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";

function getListingPictures(listing_info) {

  let pictures = [];

  for (let picIndex=1; picIndex<listing_info.listing.num_of_pictures_uploaded; ++picIndex) {
    let picture =
      <div className="col-3">
        <div className=" thumbnail" style={{backgroundColor:'#f2f2f2'}}>
          <img className="img-responsive"
               src={listing_info.listing.pictures[picIndex].path} alt="listingPicture"/>
          <div className="caption-full ">
            <h4 className="pull-right inner_contents">{listing_info.listing.pictures[picIndex].caption}</h4>
            <p/>
          </div>
        </div>
      </div>;

    pictures.push(picture)
  }

  return pictures
}

function ExploreHome() {
  const {currentListing} = useContext(CurrentListingContext);

  return (
    <div>
      <hr/>
      <div className="_1xzp5ma3" style={{fontSize:"100em !important"}}>
        Explore the house
      </div>

      <div className="row no_border">
        {getListingPictures(currentListing)}
      </div>
      <hr/>
    </div>
  );
}

export default ExploreHome
