import React, {useState, useEffect} from 'react';
import '../common/step_wizard.css';
import '../common/file_upload.css';
import {InputGroup, FormControl} from 'react-bootstrap';
import $ from 'jquery';



function readURL(event, picIndex)
{
	let input = event.target;

	if (input.files && input.files[0]) {
	        var reader = new FileReader();
	        reader.onload = function(evt) {
	            $(`#imagePreview-${picIndex}`).css('background-image', 'url('+evt.target.result +')');
	            $(`#imagePreview-${picIndex}`).hide();
	            $(`#imagePreview-${picIndex}`).fadeIn(650);
	        }
	        reader.readAsDataURL(input.files[0]);

		    $(`#previewLabel-${picIndex}`).css('opacity', 0);

		    var picturePreviewId = document.getElementById("avatar-upload-1");
			picturePreviewId.style.display = "inline-block";

		    /* Let's upload it altogether */
		    /* ISEO-TBD: let's not upload the file yet */
	        // Upload the file along with caption
			var myFormData = new FormData();
			myFormData.append("file_name", input.files[0]);
			myFormData.append("caption", $(`#imageCapture-1`).val());

			console.log("Posting New Picture");

			$.ajax({
			  enctype: 'multipart/form-data',
			  url: `/listing/3rdparty/file_upload`,
			  type: 'POST',
			  processData: false, // important
			  contentType: false, // important
			  dataType : 'application/json',
			  data: myFormData
			});
	} 	
}


function handleOnClickDeletePic(evt, picIndex)
{
    $(`#imagePreview-${picIndex}`).css('background-image', 'url("")');
    $(`#previewLabel-${picIndex}`).css('opacity', 1);
    $(`#deleteLabel-${picIndex}`).css('opacity', 0);

    var myFormData = new FormData();

    // Let's pass the file name only, not the path.
    myFormData.append("file_name",  $(`#imageDefaultUpload-1`).val());

	$.ajax({
	  enctype: 'multipart/form-data',
	  url:  `/listing/3rdparty/file_delete`,
	  type: 'POST',
	  processData: false, // important
	  contentType: false, // important
	  dataType : 'application/json',
	  data: myFormData
	});
}


function handleOnMouseHooverImagePreview(evt, picIndex)
{
	var previewLabelId = document.getElementById("previewLabel-"+picIndex);
	    
    if(previewLabelId.style.opacity==0)
    {
        var avatarDeleteId = document.getElementById("avatar-delete-"+picIndex);
        avatarDeleteId.style.display = "inline-block";
    }

    if(previewLabelId.style.opacity==0) {
        var labelElementId = document.getElementById("editLabel-"+picIndex);
        labelElementId.style.opacity = 1;

        labelElementId = document.getElementById("deleteLabel-"+picIndex);
        labelElementId.style.opacity = 1;
    }
}

function handleOnMouseOutImagePreview(evt, picIndex)
{
    var previewLabelId = document.getElementById("previewLabel-"+picIndex);

    if(previewLabelId.style.opacity==0) {
        var labelElementId = document.getElementById("editLabel-"+picIndex);
        labelElementId.style.opacity = 0;

        var labelElementId = document.getElementById("deleteLabel-"+picIndex);
        labelElementId.style.opacity = 0;
    }
}


function getCoverPhoto()
{
	return (
		<div class="col-md-12">
			<div class="d-flex flex-column">
				<div class="avatar-upload" id="avatar-upload-1" style={{maxWidth: "500px"}}>					
					<div class="avatar-edit" id="avatar-edit-1" onMouseOver={(evt) => handleOnMouseHooverImagePreview(evt, 1)}>
						<label for="imageUpload-1" id="editLabel-1"></label>
					</div>

					<div class="avatar-delete" id="avatar-delete-1" onMouseOver={(evt) => handleOnMouseHooverImagePreview(evt, 1)}>
						<input type="text" id="deletePicIcon-1"/>
						<label for="imageUpload-1" id="deleteLabel-1" onClick={ (evt) => handleOnClickDeletePic(evt, 1) }></label>
					</div>

					<div class="avatar-preview" id="avatar-preview-1" style={{width: "490px", height: "250px"}}>
						<div id="imagePreview-1" onMouseOver={(evt) => handleOnMouseHooverImagePreview(evt, 1)} 
						                         onMouseOut ={(evt) => handleOnMouseOutImagePreview(evt, 1)}>
							<input type="file" name="file_name" id="imageDefaultUpload-1" onChange={(evt) => readURL(evt, 1)} accept=".png, .jpg, .jpeg"/>
							<label class="pictureAddLabel" id="previewLabel-1" for="imageDefaultUpload-1" style={{opacity: "1", left: "55px", bottom: "80px", fontSize: "3em"}}>Add Cover Photo</label>
						</div>
					</div>

					<div class="caption">
						<input type="text" name="caption_1" id="imageCapture-1" placeholder="Add Caption"/>
					</div>
				</div>
			</div>
		</div>
	)
}



function getListingLink()
{
	return (
		<div style={{width: "70%"}}>
			<label class="control-label">URL to the listing</label>
			<InputGroup>
				<FormControl 
					placeholder="https://sfbay.craigslist.org/"
					aria-label="https://sfbay.craigslist.org/"
					aria-describedby="sourceUrl"
					name="sourceUrl"
					id="sourceUrl"
				/>
			</InputGroup>
		</div>
	)
}

function getListingPrice()
{
	return (
		<div style={{width: "20%"}}>
			<label class="control-label">Price</label>

			<div class="input-group">
				<div class="input-group-prepend">
					<span class="input-group-text">$</span>
				</div>
				<input type="text" class="form-control" id="rentalPrice" name="rentalPrice" placeholder="1000"/>
			</div>
		</div>
	)	
}


function getListingSummary()
{
	return (
		<div style={{width: "78%"}}>
			<label class="control-label">Brief Summary of rental</label>
			<InputGroup>
				<FormControl 
					placeholder="You may copy the headline of listing."
					aria-label="rentalSummary"
					aria-describedby="rentalSummary"
					id="rentalSummary"
					name="rentalSummary"
				/>
			</InputGroup>
		</div>
	)	
}



function Post3rdPartyListing()
{
	// ISEO-TBD
	// : It should be replaced with contexts
	let listing_info = {listing_id: 0}

	function handleOnSubmit(evt)
	{
		evt.preventDefault();

	    myFormData.append("file_name", $(`#imageDefaultUpload-1`).val())
	    myFormData.append("source_url", $(`#sourceUrl`).val());
	    myFormData.append("listing_source", $(`#listingSource`).val());
	    myFormData.append("rental_price", $(`#rentalPrice`).val());
	    myFormData.append("rental_summary", $(`#rentalSummary`).val());

		$.ajax({
		  enctype: 'multipart/form-data',
		  url: `/listing/3rdparty/new`,
		  type: 'POST',
		  processData: false, // important
		  contentType: false, // important
		  dataType : 'application/json',
		  data: myFormData
		});
	}

	function getListingSource()
	{
		let listOfSources = ["Craigslist", "SF Korean", "trulia", "realtor", "zillow", "rent", "roommates", "roomster", "roomies", "others"];

		return (
		 <div class="form-group" style={{width:"30%"}}>
          <label class="control-label">Listing Source</label>
			<select className="form-control" required="required" name="listingSource" id="listingSource" style={{width:"80%"}} placeholder="">
                {listOfSources.map(function(source, idx){
                	return (
                		<option value={source}> {source} </option>
                	)
                })}      
            </select>
          </div>
		);
	}


	return (
		<div>
			<div className="container" style={{textAlign:"center", marginBottom:"10px"}}>
			  <h3>Posting 3rd party listing</h3>
			</div>

			<div className="container">

				<div className="stepwizard offset-md-3">
				    <div className="stepwizard-row setup-panel">
				      <div className="stepwizard-step">
				        <a className="btn-circle btn btn-primary" href={"/listing/3rdparty/"+listing_info.listing_id+"/step1"} type="button">1</a>
				      </div>
				      <div className="stepwizard-step">
				        <a disabled="disabled" className="btn-circle btn btn-outline-secondary" href={"/listing/3rdparty/"+listing_info.listing_id+"/step2"} type="button">2</a>
				      </div>
				    </div>
				</div>

				<form role="form" action="/listing/3rdparty/new" method="POST">

				    <div className="row setup-content" id="step-1" style={{marginTop:"30px"}}>
				      <div className="col-md-6 offset-md-3">
				        <div className="col-md-12">
				          
				          <div style={{textAlign:"center"}}>
				            <h5> Summary of listing </h5>
				          </div>

				          <hr/>

				      		{/* 1. Source: Craigslist, SF Korean, other
				      			2. Link
				      			2. Price
				      		  	3. Location
				      		  	4. Cover Photo
				      		  	5. Link to the listing*/}

				      		{/* Source */}
				      		<div class="flex-container">
					      		{getListingSource()}
					      		{getListingLink()}
				      		</div>
				      		<div class="flex-container" style={{justifyContent: "space-between"}}>
					      		{getListingPrice()}
					      		{getListingSummary()}

					      	</div>
				      		<hr/>

				      		<div>
				      			<div style={{textAlign:"center"}}>
				            		<h5> Cover Photo </h5>
				          		</div>
					      		{getCoverPhoto()}
				      		</div>

				          <div style={{marginTop:"40px"}}>
				            <a className="btn btn-success btn-lg float-left" href="/listing/3rdparty/new" value="Exit">Exit</a>
				            <button className="btn btn-primary nextBtn btn-lg float-right" type="submit" name="submit" onSubmit={handleOnSubmit} value="next">Submit</button>
				          </div>
				        </div>
				      </div>
				    </div>
				</form>
			</div>
		</div>
		) 
}

export default Post3rdPartyListing;


