import React, { useState, useContext, useEffect} from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';
import {MessageContext} from '../../../../contexts/MessageContext';
import {CurrentListingContext} from '../../../../contexts/CurrentListingContext';


const ChildListing = React.forwardRef(({clickState, clickHandler, handleSelect, listing, index, messageClickHandler, removeHandler}, ref) => 
{
	//const [modalShow, setModalShow] = useState(false);
	const {setChattingContextType,
		   setChildType, 		    childType,
		   setChildIndex,           childIndex,
		   loadChattingDatabase}    = useContext(MessageContext);
    const {setCurrentChildIndex} 	= useContext(CurrentListingContext);
    const [clicked, setClicked] = useState(0);
    const [reference, setReference] = useState(null);

	const listingTitle = listing.listingSource;
	let childListing = listing.listing_id;

	let borderStyle = (clickState==1)? {
	  borderLeftStyle: "solid",
	  borderLeftColor: "#115399",
	  borderLeftWidth: "5px",
	  zIndex: 10
	} : {}

	let _childListing = {listing: listing, listingType: "_3rdparty"};

	if(clicked!=clickState)
	{
		console.log("ChildListing: click state changed");
		setClicked(clickState);
	}

	if(ref!=reference)
	{
		console.log("setReference is called");
		setReference(ref);	
	} 

	function updateMessageContext()
	{
		setChattingContextType(2);

		// ISEO-TBD: dang...the following call will trigger the reload of MessageEditor
		// and all the state will be gone when it's reloaded??
		// need to know the type of listing
		if(_childListing.listingType=="_3rdparty")
		{
			setChildType(0);
			setChildIndex(index);
			messageClickHandler(true);
		}
		else
		{
			setChildType(1);
			messageClickHandler(true);
		}
	}

	function listingClickHandler(e)
	{
		//e.preventDefault();
		clickHandler(index);

		setCurrentChildIndex(index);

		//update the message context
		updateMessageContext();
	}

	function removeListingHandler(e)
	{
		e.preventDefault();
		removeHandler(childListing);
	}

	useEffect (()=>
		{ 
			if(reference!=null)
			{
				console.log("ChildListing: useEffect: ref.current=" + reference.current);
				if(clicked==1)
				{
					console.log("clicking from useEffect");
					//reference.current.click();
				}
			} 
			else console.log("ref is null");
		},[clicked, reference]);


	return (
	  <ListItem>
	    <Grid container className="childListing" ref = {reference} onClick={listingClickHandler} style={borderStyle}>
	      <Grid item xs={4}>
	        <Carousel interval={null} slide={true} activeIndex={0} onSelect={handleSelect} className={"carousel"}>
	          <Carousel.Item>
	            <a href={childListing.listingUrl} target="_blank">
	              <img src={childListing.coverPhoto.path} alt={"Listing Picture"} className={"carouselImage"}/>
	            </a>
	          </Carousel.Item>
	        </Carousel>
	      </Grid>

	      <Grid item xs={8}>
	        <Paper className={"description flex-container"} style={{flexDirection: "column", justifyContent: "space-between"}}>
	          <Typography className={"description__title"} color={"textSecondary"} gutterBottom>
	            {listingTitle}
	          </Typography>
	          <Typography className={"description__summary"}>
	            {childListing.listingSummary}
	          </Typography>
	          <Typography> Price: ${childListing.rentalPrice} </Typography>
	          <Typography> City: {childListing.location.city} </Typography>
	          <div className="flex-container" style={{justifyContent: "space-between", marginTop: "40px"}}>
	          	<div className="flex-container" style={{justifyContent: "flex-start"}}>
		          	<img className="img-responsive center rounded-circle" src={childListing.requester.profile_picture} alt={"Hosted By"} style={{maxHeight: "70%",  height: "60px"}}/>
			        <Typography style={{marginTop: "10px", marginLeft: "5px"}}> Hosted by {childListing.requester.username} </Typography>
                </div>
                <button className="btn btn-danger" onClick={removeListingHandler}>
                  Remove
                </button>
              </div>

	        </Paper>
	      </Grid>
	    </Grid>
	  </ListItem>
	)
});

export default ChildListing;