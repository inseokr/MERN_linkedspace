import React, {useContext} from 'react';
import "../../../app.css";
import "../common/listing_style.css";

import { CurrentListingContext } from "../../../contexts/CurrentListingContext";

function getListingPictures(listing_info)
{

	let pictures = []

	for (let picIndex=1; picIndex<listing_info.listing.num_of_pictures_uploaded; ++picIndex)
	{
		let picture = 
			  <div className="col-3">
			    <div className=" thumbnail" style={{backgroundColor:'#f2f2f2'}}>
			      <img className="img-responsive"
			           src={listing_info.listing.pictures[picIndex].path.split("/")[listing_info.listing.pictures[picIndex].path.split("/").length-1]}/>
			      <div className="caption-full ">
			        <h4 className="pull-right inner_contents">{listing_info.listing.pictures[picIndex].caption}</h4>
			        <p></p>
			      </div>
			    </div>
			  </div>

		pictures.push(picture)
	}

	return pictures
}

function ExploreHome()
{
	const {listing_info} = useContext(CurrentListingContext);
	
	return (
		<>
			<hr/>
			<div className="_1xzp5ma3" style={{fontSize:"100em !important"}}>
			  Explore the house
			</div>

			<div className="row no_border">
				{getListingPictures(listing_info)}
			</div>
			<hr/>
		</>
	);
}

export default ExploreHome