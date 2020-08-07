
import React, {useState, useEffect, useContext} from 'react';
import shortid from 'shortid';
import {Redirect, useHistory} from 'react-router-dom'
import '../ListingPage/common/step_wizard.css';
import '../ListingPage/common/file_upload.css';

import {InputGroup, FormControl} from 'react-bootstrap';
import $ from 'jquery';

import {GlobalContext} from '../../contexts/GlobalContext';
import CollectLocationInfo from '../../components/location/CollectLocationInfo';


function EditProfileMain()
{
  const {currentUser} = useContext(GlobalContext);

  const action_url = (currentUser!=null) ? "/profile/"+currentUser._id+"?_method=PUT":"";

  function readURL(event)
  {
    let input = event.target;

    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(evt) {
          $(`#imagePreview`).css('background-image', 'url('+evt.target.result +')');
          $(`#imagePreview`).hide();
          $(`#imagePreview`).fadeIn(650);
      }
      reader.readAsDataURL(input.files[0]);

      $(`#previewLabel`).css('opacity', 0);

      var picturePreviewId = document.getElementById("avatar-upload");
      picturePreviewId.style.display = "inline-block";

        /* Let's upload it altogether */
        /* ISEO-TBD: let's not upload the file yet */
          // Upload the file along with caption
      var myFormData = new FormData();
      myFormData.append("file_name", input.files[0]);
      myFormData.append("caption", $(`#imageCapture`).val());

      const post_url = "/profile/" + currentUser._id + "/file_upload";

      console.log("Posting New Picture");

      $.ajax({
        enctype: 'multipart/form-data',
        url: post_url,
        type: 'POST',
        processData: false, // important
        contentType: false, // important
        dataType : 'application/json',
        data: myFormData
      });
    }   
  }


  function handleonClickDeletePic(evt)
  {
      $(`#imagePreview`).css('background-image', 'url("")');
      $(`#previewLabel`).css('opacity', 1);
      $(`#deleteLabe}`).css('opacity', 0);

      var myFormData = new FormData();

      // Let's pass the file name only, not the path.
      myFormData.append("file_name",  $(`#imageDefaultUpload`).val());

      $.ajax({
        enctype: 'multipart/form-data',
        url:  `/profile/${currentUser._id}/file_delete`,
        type: 'POST',
        processData: false, // important
        contentType: false, // important
        dataType : 'application/json',
        data: myFormData
      });
  }


  function handleOnMouseHooverImagePreview(evt)
  {
    var previewLabelId = document.getElementById("previewLabel");
        
      if(previewLabelId.style.opacity==0)
      {
          var avatarDeleteId = document.getElementById("avatar-delete");
          avatarDeleteId.style.display = "inline-block";
      }

      if(previewLabelId.style.opacity==0) {
          var labelElementId = document.getElementById("editLabel");
          labelElementId.style.opacity = 1;

          labelElementId = document.getElementById("deleteLabel");
          labelElementId.style.opacity = 1;
      }
  }

  function handleonMouseOutImagePreview(evt)
  {
      var previewLabelId = document.getElementById("previewLabel");

      if(previewLabelId.style.opacity==0) {
          var labelElementId = document.getElementById("editLabel");
          labelElementId.style.opacity = 0;

          var labelElementId = document.getElementById("deleteLabel");
          labelElementId.style.opacity = 0;
      }
  }

  function getMonthOptions()
  {
      var listOfMonths = [];
      var monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"];

      for(var monthIndex=0; monthIndex<12; monthIndex++)
      {
          listOfMonths.push(<option key={shortid.generate()} value={monthIndex+1}> {monthStrings[monthIndex]} </option>);
      }

      return listOfMonths;
  }

  function getDaysOptions()
  {
      var listOfDays = [];

      for(var dayIndex = 1; dayIndex<=31; dayIndex++)
      {
          listOfDays.push(<option key={shortid.generate()} value={dayIndex}>{dayIndex}</option>);
      }

      return listOfDays;
  }

  function allowedYears()
  {
      var listOfYears = [];

      var cur_year = new Date();
      var minimum_age = 16;
      var max_age = 100;

      var last_year       = cur_year.getFullYear() - minimum_age; 
      var begginning_year = cur_year.getFullYear() - max_age;

      for (var year=begginning_year; year < last_year; year++) {
          listOfYears.push(<option key={shortid.generate()} value={year}> {year} </option>);
      }     

      return listOfYears;
  }

  function loadDefaultValues()
  {
    if(currentUser==null) return;

    $('#first_name').val(currentUser.firstname);
    $('#last_name').val(currentUser.lastname);
    $('#user_name').val(currentUser.username);
    $('#email').val(currentUser.email);
    $('#phone').val(currentUser.phone);

    if(currentUser.address!=undefined)
    {
      $('#street').val(currentUser.address.street);
      $('#city').val(currentUser.address.city);
      $('#state').val(currentUser.address.state);
      $('#country').val(currentUser.address.country);
      $('#zipcode').val(currentUser.address.zipcode);
    }

    if(currentUser.birthdate!=undefined)
    {
      var tempDate = new Date(currentUser.birthdate);

      $('#date').val(tempDate.getDate());
      $('#month').val(tempDate.getMonth()+1);
      $('#year').val(tempDate.getFullYear());
    }
 
    if(currentUser.gender=="M")
    {
      // DOM doesn't need to add "#"
      document.getElementById("male").checked = true;
    }
    else
    {
      $("#female").prop("checked", true);
    }

    // load profile picture
    if(currentUser.profile_picture!=undefined){
       $("#imagePreview").css('background-image', 'url('+currentUser.profile_picture+')');

       $("#imagePreview").css('background-position', '0% 10%');
       $("#imagePreview").css('background-size', '100%');

       $("#imagePreview").hide();
       $("#imagePreview").fadeIn(650);

       $("#previewLabel").css('opacity', 0);

       var picturePreviewId = document.getElementById("avatar-upload");
       picturePreviewId.style.display = "inline-block";
    }
  }

  //load default value
  loadDefaultValues();

  useEffect(() => {
      loadDefaultValues();
  }, [currentUser]);

  return(
    <div>
    
      <div className="container" style={{textAlign:"center", marginBottom:"10px"}}>
        <h3>View/Edit Profile</h3>
      </div>

      <div className="container">

        <form role="form" action={action_url} method="post">
          <div className="row setup-content" id="step-2" style={{marginTop:"30px"}}>
            <div className="col-md-6 offset-md-3">
              <div className="col-md-12">
                <hr/>
                {/* upload or change  profile photos */}
                <div style={{textAlign:"center", marginTop:"20px"}}>
                  <h5>Upload/Change your profile picture</h5>
                </div>
                <div className="avatar-upload" id="avatar-upload">
                      <div className="avatar-edit" id="avatar-edit" onMouseOver={(evt) => handleOnMouseHooverImagePreview(evt)}>
                          <label htmlFor="imageUpload" id="editLabel"></label>
                      </div>

                      <div className="avatar-delete" id="avatar-delete" onMouseOver={(evt) => handleOnMouseHooverImagePreview(evt)}>
                        <input type="text" id="deletePicIcon" />
                          <label htmlFor="imageUpload" id="deleteLabel" onClick={(evt) => handleonClickDeletePic(evt)}></label>
                      </div>

                      <div className="avatar-preview" id="avatar-preview">
                          <div id="imagePreview"  onMouseOver={(evt) => handleOnMouseHooverImagePreview(evt)} onMouseOut={(evt) => handleonMouseOutImagePreview(evt)} style={{width:"100%", maxHeight:"100%", objectFit:"cover", objectPosition:"100% 0%"}}>
                                <input type='file' name="file_name" id="imageDefaultUpload" onChange={(evt) => readURL(evt)} accept=".png, .jpg, .jpeg"/>
                                <label className="pictureAddLabel" id="previewLabel" htmlFor="imageDefaultUpload" style={{opacity:"1"}}>+</label>
                          </div>
                      </div>
                </div>

                <hr/>
                <div style={{textAlign:"center", marginTop:"20px"}}>
                  <h5>User Name</h5>
                </div>
                <hr/>
                <div className="flex-container" style={{marginTop:"10px"}}>
                  <div style={{width:"50%"}}>
                    <input type="text" className="form-control" style={{width:"100%"}} name="user_name" id="user_name" placeholder="User Name" readOnly/>
                  </div>
                </div>
                <hr/>

                <div style={{textAlign:"center", marginTop:"20px"}}>
                  <h5>Your Name</h5>
                </div>
                <hr/>
                <div className="flex-container">
                  <div style={{width:"65%"}}>
                    <input type="text" className="form-control" style={{width:"95%"}} name="first_name" id="first_name" placeholder="First Name"/>
                  </div>
                  <div style={{width:"50%"}}>
                    <input type="text" className="form-control" style={{width:"100%"}} name="last_name" id="last_name" placeholder="Last Name"/>
                  </div>
                </div>
                <hr/>
                {/* contact information */}
                <div style={{textAlign:"center", marginTop:"20px"}}>
                  <h5>Contact Information</h5>
                </div>
                <hr/>
                <div className="flex-container">
                  <div style={{width:"50%"}}>
                    <input type="text" className="form-control" style={{width:"95%"}} name="phone" id="phone" placeholder="Enter your phone number"/>
                  </div>
                  <div style={{width:"65%"}}>
                    <input type="text" className="form-control" style={{width:"100%"}} name="email" id="email" placeholder="Enter your email"/>
                  </div>
                </div>
                {/* address */}
                <br/>
                <hr/>

                {CollectLocationInfo()}

                {/* birthdate */}
                <hr/>
                <div style={{textAlign:"center", marginTop:"20px"}}>
                  <h5>Birth Date</h5>
                </div>
                <div className="flex-container" style={{marginTop:"10px"}}>
                    <div style={{width:"30%"}}>
                    <select className="form-control" required="required" name="birthdate[month]" id="month" style={{width:"80%"}} placeholder="">
                      {getMonthOptions()}
                    </select>
                    </div>

                    <div style={{width:"30%"}}>
                    <select className="form-control" required="required" name="birthdate[date]" id="date" style={{width:"80%"}} placeholder="">
                      {getDaysOptions()}
                    </select>
                    </div>
                    <div style={{width:"30%"}}>
                    <select className="form-control" required="required" name="birthdate[year]" id="year" style={{width:"80%"}} placeholder="">
                      {allowedYears()}
                    </select>
                    </div>
                </div>
                <hr/>
                {/* geneder */}
                <div style={{textAlign:"center", marginTop:"20px"}}>
                  <h5>Gender</h5>
                </div>
                <hr/>
                <label className="radio-inline">
                  <input type="radio" name="gender" value="M" id="male" />Male
                </label>
                <label className="radio-inline" style={{marginLeft:"30px"}}>
                  <input type="radio" name="gender" value="F" id="female" />Female
                </label>
                <hr/>

                <div className="d-flex justify-content-between form-group">
                  <div style={{marginTop:"40px"}}>
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
