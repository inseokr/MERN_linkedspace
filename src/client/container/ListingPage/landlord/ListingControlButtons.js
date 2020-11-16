/* eslint-disable */
import React, { useContext } from 'react';
import axios from 'axios';

import '../../../app.css';
import '../common/listing_style.css';

import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import { GlobalContext } from '../../../contexts/GlobalContext';


function ListingControlButtons() {
  const { currentListing } = useContext(CurrentListingContext);
  const { currentUser } = useContext(GlobalContext);

  if (currentUser == null || currentUser == undefined) {
    return (
      <React.Fragment> </React.Fragment>
    );
  }

  function copy_posting_link(evt) {
    console.log('copy_posting_link clicked');
    /* Get the text field */
    const copyText = document.getElementById('post_link');
    copyText.value = window.location.href;
    copyText.select();

    document.execCommand('copy');
    alert(`Copied the URL: ${window.location.href}`);
  }

  async function forward2friend() {
    const post_url = `/LS_API/listing/landlord/${currentListing.list_id}/forward`;

    console.log(`forward2friend called: url = ${post_url}`);
    const result = await axios.post(post_url).then((result) => {
      console.log(`result = ${result.data.result}`);
      alert(`Result = ${result.data.result}`);
    })
      .catch((err) => {
        console.log(err);
      });
  }


  const controlButtons = currentListing.list_id !== 0
    ? (
      <div style={{ marginTop: '30px' }}>
        <input type="text" value="Hello World" id="post_link" style={{ color: 'white', borderStyle: 'none' }} />
        {/* The button used to copy the text */}
        <div className="d-flex justify-content-around">
          <button className="btn btn-primary" onClick={copy_posting_link} value={currentListing.list_id}>Copy link of this posting</button>
          <button className="btn btn-info" onClick={forward2friend} style={{ marginLeft: '70px !important' }}>Send listing to friends</button>
          <button className="btn btn-danger" style={{ marginLeft: '70px !important' }}>Check status</button>
        </div>
      </div>
    ) : '';

  return (
    <div>
      {controlButtons}
    </div>
  );
}

export default ListingControlButtons;
