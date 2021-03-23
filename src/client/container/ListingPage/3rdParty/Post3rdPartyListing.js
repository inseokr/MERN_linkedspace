/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import shortid from 'shortid';

import '../common/step_wizard.css';
import '../common/file_upload.css';

import { InputGroup, FormControl } from 'react-bootstrap';
import $ from 'jquery';

import CollectLocationInfo from '../../../components/Location/CollectLocationInfo';
import {GlobalContext} from '../../../contexts/GlobalContext';
import {CurrentListingContext} from '../../../contexts/CurrentListingContext';

import {FILE_SERVER_URL} from '../../../globalConstants';

function readURL(event, picIndex) {
  const input = event.target;

  if (input.files && input.files[0]) {
	const reader = new FileReader();
	reader.onload = function (evt) {
	    $(`#imagePreview-${picIndex}`).css('background-image', `url(${evt.target.result})`);
	    $(`#imagePreview-${picIndex}`).hide();
	    $(`#imagePreview-${picIndex}`).fadeIn(650);
	};
	reader.readAsDataURL(input.files[0]);

	$(`#previewLabel-${picIndex}`).css('opacity', 0);

	const picturePreviewId = document.getElementById('avatar-upload-1');
    picturePreviewId.style.display = 'inline-block';

	/* Let's upload it altogether */
	/* ISEO-TBD: let's not upload the file yet */
	// Upload the file along with caption
    const myFormData = new FormData();
    myFormData.append('file_name', input.files[0]);

    $.ajax({
	  enctype: 'multipart/form-data',
	  url: '/LS_API/listing/3rdparty/file_upload',
	  type: 'POST',
	  processData: false, // important
	  contentType: false, // important
	  dataType: 'application/json',
	  data: myFormData
    });
  }
}


function handleOnClickDeletePic(evt, picIndex) {
  $(`#imagePreview-${picIndex}`).css('background-image', 'url("")');
  $(`#previewLabel-${picIndex}`).css('opacity', 1);
  $(`#deleteLabel-${picIndex}`).css('opacity', 0);

  const myFormData = new FormData();

  // Let's pass the file name only, not the path.
  myFormData.append('file_name', $('#imageDefaultUpload-1').val());

  $.ajax({
	  enctype: 'multipart/form-data',
	  url: '/LS_API/listing/3rdparty/file_delete',
	  type: 'POST',
	  processData: false, // important
	  contentType: false, // important
	  dataType: 'application/json',
	  data: myFormData
  });
}


function handleOnMouseHooverImagePreview(evt, picIndex) {
  const previewLabelId = document.getElementById(`previewLabel-${picIndex}`);

  if (previewLabelId.style.opacity == 0) {
    const avatarDeleteId = document.getElementById(`avatar-delete-${picIndex}`);
    avatarDeleteId.style.display = 'inline-block';
  }

  if (previewLabelId.style.opacity == 0) {
    let labelElementId = document.getElementById(`editLabel-${picIndex}`);
    labelElementId.style.opacity = 1;

    labelElementId = document.getElementById(`deleteLabel-${picIndex}`);
    labelElementId.style.opacity = 1;
  }
}

function handleOnMouseOutImagePreview(evt, picIndex) {
  const previewLabelId = document.getElementById(`previewLabel-${picIndex}`);

  if (previewLabelId.style.opacity == 0) {
    var labelElementId = document.getElementById(`editLabel-${picIndex}`);
    labelElementId.style.opacity = 0;

    var labelElementId = document.getElementById(`deleteLabel-${picIndex}`);
    labelElementId.style.opacity = 0;
  }
}


function getCoverPhoto() {
  return (
    <div className="col-md-12">
      <div className="d-flex flex-column">
        <div className="avatar-upload" id="avatar-upload-1" style={{ maxWidth: '500px' }}>
          <div className="avatar-edit" id="avatar-edit-1" onMouseOver={evt => handleOnMouseHooverImagePreview(evt, 1)}>
            <label htmlFor="imageUpload-1" id="editLabel-1" />
          </div>

          <div className="avatar-delete" id="avatar-delete-1" onMouseOver={evt => handleOnMouseHooverImagePreview(evt, 1)}>
            <input type="text" id="deletePicIcon-1" />
            <label htmlFor="imageUpload-1" id="deleteLabel-1" onClick={evt => handleOnClickDeletePic(evt, 1)} />
          </div>

          <div className="avatar-preview" id="avatar-preview-1" style={{ width: '490px', height: '250px' }}>
            <div
              id="imagePreview-1"
              onMouseOver={evt => handleOnMouseHooverImagePreview(evt, 1)}
              onMouseOut={evt => handleOnMouseOutImagePreview(evt, 1)}
            >
              <input type="file"
                name="file_name"
                id="imageDefaultUpload-1"
                onChange={evt => readURL(evt, 1)}
                accept=".png, .jpg, .jpeg"
              />
              <label
                className="pictureAddLabel"
                id="previewLabel-1"
                htmlFor="imageDefaultUpload-1"
                style={{opacity: '1', left: '55px', bottom: '80px', fontSize: '3em'}}
              >
                Add Cover Photo
			        </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function getListingLink() {
  return (
    <div style={{ width: '70%' }}>
      <label className="control-label">URL to the listing</label>
      <InputGroup>
        <FormControl
          required
          placeholder="Copy the URL"
          aria-label="sourceUrlLabel"
          aria-describedby="sourceUrl"
          name="sourceUrl"
          id="sourceUrl"
        />
      </InputGroup>
    </div>
  );
}

function getListingPrice() {
  return (
    <div style={{ width: '20%' }}>
      <label className="control-label">Price</label>

      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">$</span>
        </div>
        <input type="text" required className="form-control" id="rentalPrice" name="rentalPrice" placeholder="1000" />
      </div>
    </div>
  );
}


function getListingSummary() {
  return (
    <div style={{ width: '78%' }}>
      <label className="control-label">Brief summary of rental</label>
      <InputGroup>
        <FormControl
          required
          placeholder="You may copy the headline or summary"
          aria-label="rentalSummary"
          aria-describedby="rentalSummary"
          id="rentalSummary"
          name="rentalSummary"
        />
      </InputGroup>
    </div>
  );
}


function Post3rdPartyListing(props) {
  const { currentDashboardUrl } = useContext(GlobalContext);
  const { fetchListingInfo, listing_info } = useContext(CurrentListingContext);
  const history = useHistory();
  const [currentListing, setCurrentListing] = useState(null);
  const [fetchListingInfoRequested, setFetchListingInfoRequested] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [listingId, setListingId] = useState('');

  function loadListingData(listing) {
    if (listing == null) return;

    $('#listingSource').val(listing.source);
    $('#sourceUrl').val(listing.url);
    $('#rentalPrice').val(listing.price);
    $('#rentalSummary').val(listing.summary);
    // Let's load the data!!

    if (listing.picture != undefined) {
      $('#imagePreview-1').css('background-image', `url(${FILE_SERVER_URL}${listing.picture}`);

      $('#imagePreview-1').css('background-position', '0% 10%');
      $('#imagePreview-1').css('background-size', '100%');

      $('#imagePreview-1').hide();
      $('#imagePreview-1').fadeIn(650);

      $('#previewLabel-1').css('opacity', 0);

      $('#avatar-upload-1').css('display', 'inline-block');
    }
  }

  function getListingSource() {
    const listOfSources = ['Airbnb', 'Craigslist', 'SF Korean', 'Trulia', 'Realtor', 'Zillow', 'Rent', 'Roommates', 'Roomster', 'Roomies', 'Zillow', 'Others'];

    return (
      <div className="form-group" style={{ width: '30%' }}>
        <label className="control-label">Listing Source</label>
        <select className="form-control" required="required" name="listingSource" id="listingSource" style={{ width: '80%' }} placeholder="">
          {listOfSources.map((source, idx) => (
            <option key={shortid.generate()} value={source}>
              {' '}
              {source}
              {' '}
            </option>
                	))}
        </select>
      </div>
    );
  }


  function _exit(evt) {
    evt.preventDefault();

    if(currentDashboardUrl!==null) {
      history.push(currentDashboardUrl);
    }
    else {
      history.push('/');
    }
  }

  async function handleFormClick(evt, listingId) {
    evt.preventDefault();

    const data = new FormData(evt.target);

    const fileName = document.getElementById('imageDefaultUpload-1');

    if(fileName.value==="" && listingId ==="")
    {
      alert("Please add cover photo");
      return;
    }

    data.append("file_name", fileName.value);

    const result = await axios.post(`/LS_API/listing/3rdparty/${listingId}/new`, data).then( async (result) => {
      fetchListingInfo('own');
      setFetchListingInfoRequested(true);
    });

  }


  if (props.location != undefined && props.location.listing_db != undefined) {
    if (currentListing == null) {
      setCurrentListing(props.location.listing_db);
      setCurrentLocation(props.location.listing_db.location);
      setCurrentCoordinates(props.location.listing_db.coordinates);
      setListingId(`${props.location.listing_db.id}/`);
    }
  }

  useEffect(() => {
    console.log('useEffect called');
    loadListingData(currentListing);
  	}, [currentListing]);


  useEffect(() => {
    if(fetchListingInfoRequested===true)
    {
      if(currentDashboardUrl!==null) {
        history.push(currentDashboardUrl);
      }
      else
      {
       history.push('/ActiveListing');
      }
      setFetchListingInfoRequested(false);
    }
  }, [listing_info])

  return (
    <div>
      <div className="container" style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3>3rd Party Listing</h3>
      </div>

      <div className="container">
          <form role="form" id="listingForm" onSubmit={(evt) => handleFormClick(evt, listingId)} action={`/LS_API/listing/3rdparty/${listingId}/new`} method="POST">

            <div className="row setup-content" id="step-1" style={{ marginTop: '30px' }}>
              <div className="col-md-6 offset-md-3">
                <div className="col-md-12">

                  {/* 1. Source: Craigslist, SF Korean, other
  				      			2. Link
  				      			2. Price
  				      		  	3. Location
  				      		  	4. Cover Photo
				      		  	5. Link to the listing */}

                {/* Source */}
                <div className="flex-container">
                  {getListingSource()}
                  {getListingLink()}
                </div>
                <div className="flex-container" style={{ justifyContent: 'space-between' }}>
                  {getListingPrice()}
                  {getListingSummary()}

                </div>

                <hr />

                <div>
                  <div style={{ textAlign: 'center' }}>
                    <h5> Location </h5>
                  </div>
                  <div style={{marginLeft:'43px'}}>
                    <CollectLocationInfo
                      location={currentLocation}
                      coordinates={currentCoordinates}
                    />
                  </div>
                </div>

                <hr />

                <div>
                  <div style={{ textAlign: 'center' }}>
                    <h5> Cover Photo </h5>
                  </div>
                  {getCoverPhoto()}
                </div>

                <div style={{ marginTop: '40px' }}>
                  <button className="btn btn-success btn-lg float-left" onClick={_exit} value="Exit">Exit</button>
                  <button className="btn btn-primary nextBtn btn-lg float-right" type="submit" value="submit">Submit</button>
                </div>
              </div>
              </div>
            </div>
          </form>
      </div>
    </div>
  );
}

export default Post3rdPartyListing;
