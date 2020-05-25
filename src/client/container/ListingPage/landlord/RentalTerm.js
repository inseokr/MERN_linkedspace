import React, {useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";


function RentalTerm()
{
	const {listing_info} = useContext(CurrentListingContext);
	
	return (
		<>
			<hr/>
			<div className="_1xzp5ma3" style={{marginTop:"40px"}}>
			  Rental terms
			</div>

			<div className="no_border" style={{marginTop:"20px"}}>
			  <div className="row sub_title wooden_background" style={{paddingTop:"8px"}}>
			    <div className="col-4" >
			      <ul>
			        <li> Asking Price: {listing_info.listing.rental_terms.asking_price} </li>
			        <li> Security Deposit: {listing_info.listing.rental_terms.security_deposit} </li>
			      </ul>
			    </div>

			    <div className="col-6" >
			      <ul>
			        <li> Rental Duration: {listing_info.listing.rental_terms.duration} months</li>
			        <li> Move-in available date: from {listing_info.listing.move_in_date.month}/{listing_info.listing.move_in_date.date}/{listing_info.listing.move_in_date.year}</li>
			      </ul>
			    </div>
			  </div>
			</div> {/* Rental terms*/}
		</>
	);
}

export default RentalTerm