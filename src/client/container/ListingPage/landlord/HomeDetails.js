/* eslint-disable */
import React, { useContext } from 'react';
import '../../../app.css';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';

const numOfItemsInOneDivision = 3;
// ISEO-TBD: It's very tricky situations
// JSX is doing too much tight checking and I can't generate something incomplete.
function formatSingleDivision(info, index, length) {
  const items = [];
  let count = 0;

  for (let curIndex = index; curIndex < length && count < numOfItemsInOneDivision; curIndex++, count++) {
    items.push(<li>{info[curIndex]}</li>);
  }

  const formatedOutput = (
    <div className="col-4" style={{ paddingTop: '8px' }}>
      <ul>
        {items}
      </ul>
    </div>
  );
  return formatedOutput;
}

function formatListInfo(info) {
  const formatedOutput = [];

  for (let index = 0; index < info.length; index += numOfItemsInOneDivision) {
    formatedOutput.push(formatSingleDivision(info, index, info.length));
  }

  return formatedOutput;
}

function HomeDetails() {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div>
      <div className="_1xzp5ma3">
        Amenities available to you
      </div>

      {/* Available Amenities */}
      <div style={{ marginTop: '20px' }}>
        <div className="row sub_title wooden_background rounded-top rounded-bottom">
          {formatListInfo(currentListing.availableAmenities)}
        </div>
      </div>

      <hr />

      <div className="_1xzp5ma3" style={{ marginTop: '40px' }}>
        Available facilities
      </div>

      <div style={{ marginTop: '20px' }}>
        <div className="row sub_title wooden_background rounded-top rounded-bottom">
          {formatListInfo(currentListing.accessibleSpaces)}
        </div>
      </div>

    </div>
  );
}

export default HomeDetails;
