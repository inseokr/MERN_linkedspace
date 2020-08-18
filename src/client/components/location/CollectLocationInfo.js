import React, {useState, useEffect} from 'react';
import {InputGroup, FormControl} from 'react-bootstrap';
import shortid from 'shortid';
import $ from 'jquery';


function CollectLocationInfo(props)
{
	let listOfStates = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

	const [location, setLocation] = useState(null);

	function loadDefaultValue(location)
	{
		if(location==null) return;
		$('#street').val(location.street);
		$('#city').val(location.city);
		$('#state').val(location.state);
		$('#zipcode').val(location.zipcode);
		$('#country').val(location.country);
	}

	if(props!=undefined && props.location!=undefined)
	{
		if(location==null)
		{
			setLocation(props.location);
		}
	}

	useEffect(() => {
		console.log("useEffect called");
		loadDefaultValue(location);
  	}, location);


	return (
		<div>
			<div className="flex-container" style={{marginTop: "20px"}}>
		    	<div className="form-group" style={{width:"60%"}}>
		        	<label className="control-label">Street</label>
		          	<input className="form-control" style={{width:"90%"}} type="text" maxLength="100" name="location[street]" id="street" placeholder="Enter Street"/>
		        </div>
		        <div className="form-group" style={{width:"25%"}}>
		        	<label className="control-label">City</label>
		        	<input className="form-control" style={{width:"90%"}} required="required" type="text" maxLength="100" name="location[city]" id="city" placeholder="Enter City"/>
		        </div>

		        <div className="form-group" style={{width:"15%"}}>
		        	<label className="control-label">State</label>
		        	<select className="form-control" style={{width:"90%"}} required="required" name="location[state]" id="state" placeholder="State">
		        		{listOfStates.map((state) => <option key={shortid.generate()} value={state}>{state}</option>)}
		        	</select>
		        </div>
		    </div>

		    <div className="flex-container">
				<div className="form-group" style={{width:"25%"}}>
					<label className="control-label">Zipcode</label>
					<input className="form-control" style={{width:"80%"}} required="required" name="location[zipcode]" id="zipcode" placeholder="Zipcode"/>
				</div>
				<div className="form-group" style={{width:"30%"}}>
					<label className="control-label">Country</label>
					<input className="form-control" style={{width:"80%"}} required="required"  name="location[country]" id="country" placeholder="Country"/>
				</div>
			</div>
		</div>

	)
} 

export default CollectLocationInfo;