import React, { useState } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';


function ChildListing(props)
{
	console.log("ChildListing: clickState="+ props.clickState);
	const listingTitle = props.listing.source;

	let childListing = props.listing;

	console.log("childListing="+JSON.stringify(childListing));

	let borderStyle = (props.clickState==1)? {
	  borderLeftStyle: "solid",
	  borderLeftColor: "#115399",
	  borderLeftWidth: "5px"
	} : {}

	function listingClickHandler(e)
	{
		//e.preventDefault();
		props.clickHandler(props.index);
	}

	return (
	  <ListItem>
	    <Grid container className="childListing" onClick={listingClickHandler} style={borderStyle}>
	      <Grid item xs={4}>
	        <Carousel interval={null} slide={true} activeIndex={0} onSelect={props.handleSelect} className={"carousel"}>
	          <Carousel.Item>
	            <a href={childListing.url}>
	              <img src={childListing.picture} alt={"Listing Picture"} className={"carouselImage"}/>
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
	            {childListing.summary}
	          </Typography>

	          <div className="flex-container" style={{justifyContent: "space-between"}}>
                {/* ISEO-TBD:  Let's add messaging icon */}
                <MessageEditorIcon clickHandler={props.messageClickHandler}/>

                <button className="btn btn-danger">
                  Remove
                </button>
              </div>

	        </Paper>
	      </Grid>
	    </Grid>
	  </ListItem>
	)
}

export default ChildListing