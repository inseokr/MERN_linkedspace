import React, { useState } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import ChildListing from './ChildListing'


function ChildListingsView(props)
{
	let initClickStates = [];
	const [clickStates, setClickStates] = useState(initClickStates);

	function handleClickState(index) {

		console.log("handleClickState, index="+index);

		// update clickStates where the index is referring to
		let listClickStates  = [...clickStates];

		// reset all others
		for(var i=0; i< listClickStates.length; i++)
		{
			listClickStates[i] = 0;
		}

		listClickStates[index] = 1;

		setClickStates([...listClickStates]);

		// More to come....

	}

	// ISEO-TBD: It's just a test data
	/*let listings = [];
	let tempListing1 = { listingSource: "craigslist", 
	                     coverPhoto: {path: "/public/user_resources/pictures/3rdparty/5ea0f58e88da6d5754a0f651_craigslist_example.jpg", caption: ""}, 
	                     listingSummary: "4br - 2254ft2 - Beautiful Mission San Jose SFH for Rent ",
	                     listingUrl: "https://sfbay.craigslist.org/eby/apa/d/fremont-beautiful-mission-san-jose-sfh/7133815804.html",
	                   }

	let tempListing2 = { listingSource: "craigslist", 
	                     coverPhoto: {path: "/public/user_resources/pictures/3rdparty/5ea0f58e88da6d5754a0f651_craigslist_example_1.jpg", caption: ""}, 
	                     listingSummary: "3br - 1980ft2 - Spectacular Location and View! Fremont Mission San Jose",
	                     listingUrl: "https://sfbay.craigslist.org/eby/apa/d/fremont-spectacular-location-and-view/7133111273.html",
	                   }

	listings.push(tempListing1);
	listings.push(tempListing2);*/

	//if((props.listing.inventory!=undefined) && (props.listing.inventory.length>1))
	if((props.childListings!=undefined) && (props.childListings.length>=1))
	{
	  console.log("getChildListing: got some child listing");

	  let childListingsViews = [];

	    props.childListings.map(function(childListing, index) {
	  	console.log("childListingsViews: index="+index);
	  	childListingsViews.push(<ChildListing clickState={clickStates[index]} 
	  							              clickHandler={handleClickState} 
	  							              handleSelect={props.handleSelect} 
	  							              listing={childListing}
	  							              index={index}
	  							              messageClickHandler={props.messageClickHandler}/>)
	  });

	  return (
	  		<>
	  			{childListingsViews}
	  		</>
	  	)
	}
	else
	{
	  console.log("getChildListing: no listing available");
	  return null;
	}
}

export default ChildListingsView;