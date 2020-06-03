import React, {useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";

function ListingIntro()
{
	const {currentListing} = useContext(CurrentListingContext);
	
	return (
	  <div className="row">
	    <div className="col-7">
	      <div className="_tw4pe52">
	        {currentListing.listing.num_of_total_guests} guests {currentListing.listing.num_of_bedrooms}  bedroom {currentListing.listing.num_of_total_baths} bath
	      </div>

	      <div className="_1ezjrwzo" style={{marginTop:"20px !important", whiteSpace:"pre-line"}}>
	        {currentListing.listing.summary_of_listing}
	      </div>
	    </div> 

	    <div className="col-4" style={{marginLeft:"10px"}}>
	      <div className="_tw4pe52">
	        Hosted by In Seo
	      </div>
	      <div style={{maxWidth:"100px", marginTop:"20px"}}>
	        <img src="inseo_profile.jpg" className="center rounded-circle" style={{width:"100%", maxHeight:"100%"}}/>
	      </div>

	      <div style={{marginLeft:"30px"}}>
	        <span className="rating">
		      	<span role="img" aria-label="distance">
		            <span className="_13wa7798">
		            	<svg viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" style={{height:"1em",width:"1em",display:"block",fill:"currentColor"}}>
		            		<path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z">
		            		</path>
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
	  </div>
	);

}
export default ListingIntro
