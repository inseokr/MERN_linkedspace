import React, { useState, useContext } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import {CurrentListingContext} from '../../../../contexts/CurrentListingContext';
import ChildListing from './ChildListing'


function ChildListingsView(props)
{
	let initClickStates = [];
	const [clickStates, setClickStates] = useState(initClickStates);
	const {currentListing} = useContext(CurrentListingContext);

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

	if((currentListing.child_listings._3rd_party_listings.length>=1))
	{
	  console.log("getChildListing: got some child listing");

	  let childListingsViews = [];

	    currentListing.child_listings._3rd_party_listings.map(function(childListing, index) {
	  	console.log("childListingsViews: index="+index);
	  	childListingsViews.push(<ChildListing clickState={clickStates[index]} 
	  							              clickHandler={handleClickState} 
	  							              handleSelect={props.handleSelect} 
	  							              listing={childListing.listing_id}
	  							              index={index}
	  							              messageClickHandler={props.messageClickHandler}
	  							              removeHandler={props.removeHandler}/>)
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