import React, {useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";


function getMap()
{
/* ISEO-TBD: get the map information 		        
{`https://maps.googleapis.com/maps/api/geocode/json?address=${currentListing.listing.rental_property_information.location.street},+${currentListing.listing.rental_property_information.location.city},+${currentListing.listing.rental_property_information.location.state}&key=AIzaSyDhNOl53GKZUx7LI66vSng7VUWkHTUgVnE`}
*/
	return "Under Construction"
}

function LocationInfo()
{
	const {currentListing} = useContext(CurrentListingContext);
	
	return (
		<div className="row no_border">
		  <div className="col-7">
		    <div>
		      <div className="_1xzp5ma3" style={{fontSize:"100em, !important"}}>
		        Location
		      </div>
		      <div className="inner_contents" style={{marginTop:"5px"}}>
		        {currentListing.listing.rental_property_information.location.street}, {currentListing.listing.rental_property_information.location.city}, {currentListing.listing.rental_property_information.location.state}, {currentListing.listing.rental_property_information.location.zipcode}, {currentListing.listing.rental_property_information.location.country}
		      </div>
		      <textarea id="map_url" style={{display:"none"}}>
		      	{getMap()}
		      </textarea>
		      <div style={{height:"300px", marginTop:"5px"}}>
		        <div id="map" style={{height:"80%",width:"85%"}}>
		        </div>
		      </div>
		    </div>
		  </div>

		  <div className="col-5" style={{marginTop:"70px"}}>

		    <div className="subtitle_info">
		      <div className="sub_title">
		        Neighborhood
		      </div>
		      <div className="inner_contents" style={{marginTop:"2px", whiteSpace:"pre-line"}}>
		        {currentListing.listing.summary_of_neighborhood}
		      </div>
		    </div>

		    <div className="subtitle_info" style={{marginTop:"20px"}}>
		      <div className="sub_title">
		        Transportation
		      </div>
		      <div className="inner_contents" style={{marginTop:"2px",whiteSpace:"pre-line"}}>
		        {currentListing.listing.summary_of_transportation}
		      </div>
		    </div>
		  </div>
		</div> 
	);

}

export default LocationInfo