import React, {useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";


function ListingControlButtons()
{
	const {currentListing} = useContext(CurrentListingContext);

	function copy_posting_link(evt) {

	  console.log("copy_posting_link clicked");
	  /* Get the text field */
	  var copyText = document.getElementById("post_link");

	  var currentURL = document.URL;
	  var hostSection = currentURL.split("listing")[0];
	  copyText.value = evt.target.value;
	  copyText.select();
	  document.execCommand("copy");
	}
	 
	let controlButtons = currentListing.list_id!=0 ?
		  <div style={{marginTop:"30px"}}>
		    <input type="text" value="Hello World" id="post_link" style={{color:"white", borderStyle:"none"}}/>
		    {/* The button used to copy the text */}
		    <div className="d-flex justify-content-around">
		      <button className="btn btn-primary" onClick={copy_posting_link} value={currentListing.list_id}>Copy link of this posting</button>
		      <form role="form" action="/listing/landlord/{currentListing.list_id}/forward?_method=PUT" method="post">
		        <button className="btn btn-info" style={{marginLeft:"70px !important"}}>Send listing to friends</button>
		      </form>
		      <button className="btn btn-danger" style={{marginLeft:"70px !important"}}>Check status</button>
		    </div>
		  </div>  : ""

	return (
		<>
			{controlButtons}
		</>
	);
}

export default ListingControlButtons