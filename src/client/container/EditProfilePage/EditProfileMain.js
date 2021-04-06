/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react';
import shortid from 'shortid';
import { Redirect, useHistory } from 'react-router-dom';
import '../ListingPage/common/step_wizard.css';
import '../ListingPage/common/file_upload.css';

import { InputGroup, FormControl } from 'react-bootstrap';
import $ from 'jquery';

import { GlobalContext } from '../../contexts/GlobalContext';
import CollectLocationInfo from '../../components/Location/CollectLocationInfo';
import {API_SERVER_URL, FILE_SERVER_URL} from '../../globalConstants';


function EditProfileMain() {
  const { currentUser } = useContext(GlobalContext);

  const action_url = (currentUser != null) ? `/LS_API/profile/${currentUser._id}?_method=PUT` : '';
  const currentAddress = (currentUser != null && currentUser.address !== undefined) ? 
                          `${currentUser.address.street}, ${currentUser.address.city}, ${currentUser.address.state}, ${currentUser.address.zipcode}, ${currentUser.address.country}`
                          : '';

  //console.warn(`currentAddress=${currentAddress}`);
  function readURL(event) {
    const input = event.target;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        $('#imagePreview').css('background-image', `url(${evt.target.result})`);
        $('#imagePreview').hide();
        $('#imagePreview').fadeIn(650);
      };
      reader.readAsDataURL(input.files[0]);

      $('#previewLabel').css('opacity', 0);

      const picturePreviewId = document.getElementById('avatar-upload');
      picturePreviewId.style.display = 'inline-block';

      /* Let's upload it altogether */
      /* ISEO-TBD: let's not upload the file yet */
      // Upload the file along with caption
      const myFormData = new FormData();
      myFormData.append('file_name', input.files[0]);
      myFormData.append('caption', $('#imageCapture').val());

      const post_url = `/LS_API/profile/${currentUser._id}/file_upload`;

      console.log('Posting New Picture');

      $.ajax({
        enctype: 'multipart/form-data',
        url: post_url,
        type: 'POST',
        processData: false, // important
        contentType: false, // important
        dataType: 'application/json',
        data: myFormData
      });
    }
  }


  function handleonClickDeletePic(evt) {
    $('#imagePreview').css('background-image', 'url("")');
    $('#previewLabel').css('opacity', 1);
    $('#deleteLabel').css('opacity', 0);

    const myFormData = new FormData();

    // Let's pass the file name only, not the path.
    myFormData.append('file_name', $('#imageDefaultUpload').val());

    $.ajax({
      enctype: 'multipart/form-data',
      url: `/LS_API/profile/${currentUser._id}/file_delete`,
      type: 'POST',
      processData: false, // important
      contentType: false, // important
      dataType: 'application/json',
      data: myFormData
    });
  }


  function handleOnMouseHooverImagePreview(evt) {
    const previewLabelId = document.getElementById('previewLabel');

    if (previewLabelId.style.opacity == 0) {
      const avatarDeleteId = document.getElementById('avatar-delete');
      avatarDeleteId.style.display = 'inline-block';
    }

    if (previewLabelId.style.opacity == 0) {
      let labelElementId = document.getElementById('editLabel');
      labelElementId.style.opacity = 1;

      labelElementId = document.getElementById('deleteLabel');
      labelElementId.style.opacity = 1;
    }
  }

  function handleonMouseOutImagePreview(evt) {
    const previewLabelId = document.getElementById('previewLabel');

    if (previewLabelId.style.opacity == 0) {
      var labelElementId = document.getElementById('editLabel');
      labelElementId.style.opacity = 0;

      var labelElementId = document.getElementById('deleteLabel');
      labelElementId.style.opacity = 0;
    }
  }

  function getMonthOptions() {
    const listOfMonths = [];
    const monthStrings = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      listOfMonths.push(<option key={shortid.generate()} value={monthIndex + 1}>
        {' '}
        {monthStrings[monthIndex]}
        {' '}
                        </option>);
    }

    return listOfMonths;
  }

  function getDaysOptions() {
    const listOfDays = [];

    for (let dayIndex = 1; dayIndex <= 31; dayIndex++) {
      listOfDays.push(<option key={shortid.generate()} value={dayIndex}>{dayIndex}</option>);
    }

    return listOfDays;
  }

  function allowedYears() {
    const listOfYears = [];

    const cur_year = new Date();
    const minimum_age = 16;
    const max_age = 100;

    const last_year = cur_year.getFullYear() - minimum_age;
    const begginning_year = cur_year.getFullYear() - max_age;

    for (let year = begginning_year; year < last_year; year++) {
      listOfYears.push(<option key={shortid.generate()} value={year}>
        {' '}
        {year}
        {' '}
                       </option>);
    }

    return listOfYears;
  }

  function loadDefaultValues() {
    if (currentUser == null) return;

    $('#first_name').val(currentUser.firstname);
    $('#last_name').val(currentUser.lastname);
    $('#user_name').val(currentUser.username);
    $('#email').val(currentUser.email);
    $('#phone').val(currentUser.phone);

    if (currentUser.address != undefined) {
      $('#street').val(currentUser.address.street);
      $('#city').val(currentUser.address.city);
      $('#state').val(currentUser.address.state);
      $('#country').val(currentUser.address.country);
      $('#zipcode').val(currentUser.address.zipcode);
    }

    if (currentUser.birthdate != undefined) {
      const tempDate = new Date(currentUser.birthdate);

      $('#date').val(tempDate.getDate()+1);
      $('#month').val(tempDate.getMonth() + 1);
      $('#year').val(tempDate.getFullYear());
    }

    switch(currentUser.gender) {
      case 'M':
        $('#male').prop('checked', true);
        break;
      case 'F':
        $('#female').prop('checked', true);
        break;
      case 'O':
        $('#other').prop('checked', true);
        break;
      default: 
        $('#nodisclosure').prop('checked', true);
        break;
    }


    // load profile picture
    if (currentUser.profile_picture != undefined) {
      $('#imagePreview').css('background-image', `url(${FILE_SERVER_URL}${currentUser.profile_picture}`);
      $('#imagePreview').css('background-position', '0% 10%');
      $('#imagePreview').css('background-size', '100%');

      $('#imagePreview').hide();
      $('#imagePreview').fadeIn(650);

      $('#previewLabel').css('opacity', 0);

      // var picturePreviewId = document.getElementById("avatar-upload");
      $('#avatar-upload').css('display', 'inline-block');
      // picturePreviewId.style.display = "inline-block";
    }
  }

  useEffect(() => {
    loadDefaultValues();
  }, []);

  return (
    <div>

      <div className="container" style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3>View/Edit Profile</h3>
      </div>

      <div className="container">

        <form role="form" action={action_url} method="post">
          <div className="row setup-content" id="step-2" style={{ marginTop: '30px' }}>
            <div className="col-md-6 offset-md-3">
              <div className="col-md-12">
                <hr />
                {/* upload or change  profile photos */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <h5>Upload/Change your profile picture</h5>
                </div>
                <div className="avatar-upload" id="avatar-upload" style={{marginLeft:'150px'}}>
                  <div className="avatar-edit" id="avatar-edit" onMouseOver={evt => handleOnMouseHooverImagePreview(evt)}>
                    <label htmlFor="imageUpload" id="editLabel" />
                  </div>

                  <div className="avatar-delete" id="avatar-delete" onMouseOver={evt => handleOnMouseHooverImagePreview(evt)}>
                    <input type="text" id="deletePicIcon" />
                    <label htmlFor="imageUpload" id="deleteLabel" onClick={evt => handleonClickDeletePic(evt)} />
                  </div>

                  <div className="avatar-preview" id="avatar-preview">
                    <div
                      id="imagePreview"
                      onMouseOver={evt => handleOnMouseHooverImagePreview(evt)}
                      onMouseOut={evt => handleonMouseOutImagePreview(evt)}
                      style={{
                        width: '100%', maxHeight: '100%', objectFit: 'cover', objectPosition: '100% 0%'
                      }}
                    >
                      <input type="file" name="file_name" id="imageDefaultUpload" onChange={evt => readURL(evt)} accept=".png, .jpg, .jpeg" />
                      <label className="pictureAddLabel" id="previewLabel" htmlFor="imageDefaultUpload" style={{ opacity: '1' }}>+</label>
                    </div>
                  </div>
                </div>

                <hr />
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <h5>User Name</h5>
                </div>
                <hr />
                <div className="flex-container" style={{ marginTop: '10px', justifyContent: 'center' }}>
                  <div style={{ width: '50%' }}>
                    <input type="text" className="form-control" style={{ width: '100%' }} name="user_name" id="user_name" placeholder="User Name" readOnly />
                  </div>
                </div>
                <hr />

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <h5>Your Name</h5>
                </div>
                <hr />
                <div className="flex-container">
                  <div style={{ width: '65%' }}>
                    <input type="text" required className="form-control" style={{ width: '95%' }} name="first_name" id="first_name" placeholder="First Name" />
                  </div>
                  <div style={{ width: '50%' }}>
                    <input type="text" required className="form-control" style={{ width: '100%' }} name="last_name" id="last_name" placeholder="Last Name" />
                  </div>
                </div>
                <hr />
                {/* contact information */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <h5>Contact Information</h5>
                </div>
                <hr />
                <div className="flex-container">
                  <div style={{ width: '50%' }}>
                    <input type="text" className="form-control" style={{ width: '95%' }} name="phone" id="phone" placeholder="Enter your phone number" />
                  </div>
                  <div style={{ width: '65%' }}>
                    <input type="text" className="form-control" style={{ width: '100%' }} name="email" id="email" placeholder="Enter your email" />
                  </div>
                </div>
                {/* address */}
                <br />
                <hr />

                <CollectLocationInfo currentAddress={currentAddress}/>

                {/* birthdate */}
                <hr />
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <h5>Birth Date</h5>
                </div>
                <div className="flex-container" style={{ marginTop: '10px' }}>
                  <div style={{ width: '30%' }}>
                    <select className="form-control" required="required" name="birthdate[month]" id="month" style={{ width: '80%' }} placeholder="">
                      {getMonthOptions()}
                    </select>
                  </div>

                  <div style={{ width: '30%' }}>
                    <select className="form-control" required="required" name="birthdate[date]" id="date" style={{ width: '80%' }} placeholder="">
                      {getDaysOptions()}
                    </select>
                  </div>
                  <div style={{ width: '30%' }}>
                    <select className="form-control" required="required" name="birthdate[year]" id="year" style={{ width: '80%' }} placeholder="">
                      {allowedYears()}
                    </select>
                  </div>
                </div>
                <hr />
                {/* geneder */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <h5>Gender</h5>
                </div>
                <hr />
                <label className="radio-inline">
                  <input type="radio" name="gender" value="M" id="male" />
                  <span style={{marginLeft: '3px' }}> Male </span>
                </label>
                <label className="radio-inline" style={{ marginLeft: '30px'}}>
                  <input type="radio" name="gender" value="F" id="female" />
                  <span style={{marginLeft: '3px' }}> Female </span>
                </label>
                <label className="radio-inline" style={{ marginLeft: '30px' }}>
                  <input type="radio" name="gender" value="O" id="other" />
                  <span style={{marginLeft: '3px' }}> Other </span>
                </label>
                <label className="radio-inline" style={{ marginLeft: '30px' }}>
                  <input type="radio" name="gender" value="N" id="nodisclosure" />
                  <span style={{marginLeft: '3px' }}> Prefer not to say </span>
                </label>

                <hr />

                <div className="d-flex justify-content-between form-group">
                  <div style={{ marginTop: '40px' }}>
                    <button className="btn btn-primary nextBtn btn-lg float-right" type="submit" name="submit" value="final">Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}

export default EditProfileMain;
