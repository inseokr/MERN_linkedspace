import React, { Component, useEffect, createContext, useContext } from 'react';
import {Link} from 'react-router-dom';
import '../../../app.css';
import "../common/listing_style.css";
import { CurrentListingContext } from '../../../contexts/CurrentListingContext';
import GetRatingDeco from '../../../components/decos/GetRatingDeco';
import FormatListItems from '../../../components/decos/FormatListItems';

export default class ListingTenantMainPage extends Component {
  static contextType = CurrentListingContext;

  constructor(props) {
    super(props);

    console.log("props = " + JSON.stringify(props));
  }

  componentDidMount() {
    console.log("ListingTenantMainPage: componentDidMount");

    if(this.props.match!==undefined)
      this.context.fetchCurrentListing(this.props.match.params.id, "tenant");
  }

  componentWillMount() {
    console.log("ListingTenantMainPage: componentWillMount");
    /* load listing information by listing ID */
    // <note> this parameter will contain the value of ":id" in the followinng route path
    // /listing/landlord/:id
    //this.context.fetchCurrentListing(this.props.match.params.id);
  }


  getNumOfRoomMates() {
    if(this.context.currentListing.num_of_requested_roommates>0) {
      return (
        <>
          <div className="sub_title" style={{marginTop: "20px "}}>
            Additional tenant?
          </div>
          <div className="_1ezjrwzo">
            {this.context.currentListing.num_of_requested_roommates}
          </div>
        </>
      )
    }
    else return null;
  }


  getRentalPreference() {
    function preprocessingListing(listing, preferences) {
      if (listing.rental_preferences.furnished!=='off') {
        preferences.push("Furnished");
      }

      if (listing.rental_preferences.kitchen!=='off') {
        preferences.push("Kitchen");
      }

      if (listing.rental_preferences.parking!=='off')
      {
        preferences.push("Parking");
      }

      if (listing.rental_preferences.internet!=='off') {
        preferences.push("Internet");
      }

      if (listing.rental_preferences.private_bathroom!=='off') {
        preferences.push("Private Bathroom");
      }

      if (listing.rental_preferences.separate_access!=='off') {
        preferences.push("Separate Entrance");
      }

      if (listing.rental_preferences.smoking_allowed!=='off') {
        preferences.push("Smoke Friendly");
      }

      if (listing.rental_preferences.pet_allowed!=='off') {
        preferences.push("Pet Allowed");
      }

      if (listing.rental_preferences.easy_access_public_transport!=='off') {
        preferences.push("Easy Access to Public Transport");
      }
    }

    let preferences = [];

    preprocessingListing(this.context.currentListing, preferences);

    return (
      <>
        <div className="_1xzp5ma3">
          Rental Preferences
        </div>

        <div className="wooden_background border rounded-top rounded-bottom" style={{marginTop:"20px"}}>
          <div className="row sub_title" style={{paddingTop:"8px "}}>
            {FormatListItems(preferences, 3)}
          </div>
        </div>
      </>
    )
  }

  getReferringFriends() {
    let friends = [
      {
        profile_picture: "/public/user_resources/pictures/friends/Chinh - Vy.jpg",
        username: "Chinh Le"
      },
      {
        profile_picture: "/public/user_resources/pictures/friends/Jason.jpg",
        username: "Jason Kim"
      },
      {
        profile_picture: "/public/user_resources/pictures/friends/Peter.jpg",
        username: "Peter Bae"
      }
    ];

    return (
      <div className="row">
        {friends.map((friend, index) => (
          <div className="col-3" key={friend.username}>
            <div className=" thumbnail">
              <img className="img-responsive center rounded-circle" src={friend.profile_picture}/>
              <span className="_so3dpm2" style={{marginLeft:"40px"}}>{friend.username}</span>
              <div style={{marginLeft:"60px"}}>
                {GetRatingDeco(index)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  getContactInformation() {
    return (
      <>
        <div style={{marginTop:"10px"}}>Contact</div>
        <div className="sub_title" style={{marginTop:"10px "}}>
          <ul  style={{listStyleType:"none"}}>
            <li> Phone Number: {this.context.currentListing.phone} </li>
            <li> E-mail: {this.context.currentListing.email} </li>
          </ul>
        </div>
      </>
    )
  }


  getListingControls() {
    return (
      <div style={{marginTop:"30px"}}>
        <input type="text" defaultValue="Hello World" id="post_link" style={{color:"white", borderStyle:"none"}}/>

        <div className="d-flex justify-content-start">
          <button className="btn btn-primary">Copy link of this posting</button>
          <button className="btn btn-info" style={{marginLeft:"70px "}}>Send listing to friends</button>
          <Link to={"/listing/tenant/"+this.props.match.params.id+"/dashboard"}>
            <button className="btn btn-danger" style={{marginLeft:"70px "}}>Dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  render() {

    if(this.context.currentListing===undefined) {
      return (<> </>)
    }

    // ISEO-TBD: not sure how to match it?
    let footer = "";
    let rentalUnitType = (this.context.currentListing.rental_preferences.rent_whole_unit === "off") ?
      this.context.currentListing.rental_preferences.num_of_rooms+"bedroom(s)" :
      "Whole unit";
    return (
      <>
        <div className="row">

          <div className="col-3" style={{height:"600px", marginLeft:"30px", border:"none"}}>
            <img src={this.context.currentListing.profile_pictures[0].path} align="right" style={{width:"100%", maxHeight:"100%", objectFit:"cover", objectPosition:"100% 0%"}}/>
            <div className="border border-top-0" style={{textAlign:"center", backgroundColor:"#FFFFFF"}}> {this.context.currentListing.profile_pictures[0].caption} </div>
          </div>

          <div className="col-5" style={{borderStyle:"none ", height:"500px", marginLeft:"30px"}}>
            <div className="sub_title" style={{textAlign:"center", marginTop:"20px"}}>
              Self-introduction
            </div>
            <div className="_1ezjrwzo" style={{marginTop:"20px"}}>
              {this.context.currentListing.rental_description}
            </div>
          </div>

          <div className="col-3 wooden_background border" style={{textAlign:"center",borderStyle:"none ", height:"600px", marginLeft:"30px"}}>

            <div className="sub_title" style={{marginTop:"20px"}}>
              Preferred Location
            </div>
            <div className="_1ezjrwzo">
              {this.context.currentListing.location.city}, {this.context.currentListing.location.state}, {this.context.currentListing.location.country}, {this.context.currentListing.location.zipcode}
            </div>


            <div className="sub_title" style={{marginTop:"20px "}}>
              Distance Range Allowed
            </div>
            <div className="_1ezjrwzo">
              {this.context.currentListing.maximum_range_in_miles} miles
            </div>

            <div className="sub_title" style={{marginTop:"20px "}}>
              Budget
            </div>
            <div className="_1ezjrwzo">
              ${this.context.currentListing.rental_budget}.00
            </div>

            <div className="sub_title" style={{marginTop:"20px "}}>
              Move-in Date
            </div>
            <div className="_1ezjrwzo">
              {this.context.currentListing.move_in_date.month}/{this.context.currentListing.move_in_date.date}/{this.context.currentListing.move_in_date.year}
            </div>

            <div className="sub_title" style={{marginTop:"20px "}}>
              Rental Duration
            </div>
            <div className="_1ezjrwzo">
              {this.context.currentListing.rental_duration} months
            </div>

            <div className="sub_title" style={{marginTop:"20px "}}>
              Preferred rental unit type
            </div>
            <div className="_1ezjrwzo">
              {this.context.currentListing.rental_preferences.rental_unit_type}
            </div>

            <div className="sub_title" style={{marginTop:"20px "}}>
              Number of rooms or Whole Unit?
            </div>
            <div className="_1ezjrwzo">
              {rentalUnitType}
            </div>

            {this.getNumOfRoomMates()}

          </div>
          <div className="container" style={{borderStyle:"none ", marginTop:"40px"}}>
            <hr/>
            {this.getRentalPreference()}
            <hr/>

            <div className="_1xzp5ma3" style={{marginTop:"40px", marginLeft:"20px"}}>
              Referring Mutual Friends
            </div>

            <div className="row" style={{marginTop:"30px"}}>
              <div className="col-7 wooden_background border rounded-top rounded-bottom">
                {this.getReferringFriends()}
              </div>

              <div className="col-lg-4 sub_title wooden_background border rounded-top rounded-bottom" style={{maxHeight:"102px", textAlign: "center", marginLeft: "80px "}}>
                {this.getContactInformation()}
              </div>
            </div>

            {this.getListingControls()}
          </div>
        </div>

        {footer}
      </>
    );
  }
}
