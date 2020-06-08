import React, {useState, useEffect} from 'react';
import {InputGroup, FormControl} from 'react-bootstrap';
import $ from 'jquery';


function CollectLocationInfo()
{

	let listOfStates = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

	return (
		<div>
			<div class="flex-container" style={{marginTop: "20px"}}>
		    	<div class="form-group" style={{width:"60%"}}>
		        	<label class="control-label">Street</label>
		          	<input class="form-control" style={{width:"90%"}} type="text" maxLength="100" name="location[street]" id="street" placeholder="Enter Street"/>
		        </div>
		        <div class="form-group" style={{width:"25%"}}>
		        	<label class="control-label">City</label>
		        	<input class="form-control" style={{width:"90%"}} required="required" type="text" maxLength="100" name="location[city]" id="city" placeholder="Enter City"/>
		        </div>

		        <div class="form-group" style={{width:"15%"}}>
		        	<label class="control-label">State</label>
		        	<select class="form-control" style={{width:"90%"}} required="required" name="location[state]" id="state" placeholder="State">
		        		{listOfStates.map((state) => <option value={state}>{state}</option>)}
		        	</select>
		        </div>
		    </div>

		    <div class="flex-container">
				<div class="form-group" style={{width:"25%"}}>
					<label class="control-label">Zipcode</label>
					<input class="form-control" style={{width:"80%"}} required="required" name="location[zipcode]" id="zipcode" placeholder="Zipcode"/>
				</div>
				<div class="form-group" style={{width:"30%"}}>
					<label class="control-label">Country</label>
					<input class="form-control" style={{width:"80%"}} required="required"  name="location[country]" id="country" placeholder="Country"/>
				</div>
			</div>
		</div>

	)
} 

export default CollectLocationInfo;