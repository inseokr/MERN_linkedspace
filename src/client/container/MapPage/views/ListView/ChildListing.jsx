import React, { useState } from 'react';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel'
import constructListingInformationBullets from '../../helper/helper';
import MessageEditorIcon from '../../../../components/Message/MessageEditorIcon';


function ChildListing(props)
{
	const [modalShow, setModalShow] = useState(false);

	console.log("ChildListing: clickState="+ props.clickState);
	const listingTitle = props.listing.listingSource;

	let childListing = props.listing.listing_id;

	console.log("childListing="+JSON.stringify(childListing));

	let borderStyle = (props.clickState==1)? {
	  borderLeftStyle: "solid",
	  borderLeftColor: "#115399",
	  borderLeftWidth: "5px"
	} : {}


	let showModal = () => {
		setModalShow(true);
	}

	let handleClose = () => {
		setModalShow(false);
	}

	function listingClickHandler(e)
	{
		//e.preventDefault();
		props.clickHandler(props.index);
	}

	function removeListingHandler(e)
	{
		e.preventDefault();
		props.removeHandler(childListing);
	}

	let _childListing = {listing: props.listing, listingType: "_3rdparty"};

	return (
	  <ListItem>
	    <Grid container className="childListing" onClick={listingClickHandler} style={borderStyle}>
	      <Grid item xs={4}>
	        <Carousel interval={null} slide={true} activeIndex={0} onSelect={props.handleSelect} className={"carousel"}>
	          <Carousel.Item>
	            <a href={childListing.listingUrl}>
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

	          <div className="flex-container" style={{justifyContent: "space-between"}}>
                {/* ISEO-TBD:  Let's add messaging icon */}
                <MessageEditorIcon clickHandler={props.messageClickHandler} callerType="child" childListing={_childListing} index={props.index}/>
                <button className="btn btn-danger" onClick={removeListingHandler}>
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