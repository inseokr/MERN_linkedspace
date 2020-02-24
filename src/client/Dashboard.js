import React, { Component } from 'react';
import './app.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";


var lastMenu = "";

// ISEO: Please refer the following link
// https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274

export default class Dashboard extends Component {
  
  state = {
    data: [],
    dataLoaded: false
  };

  getListInformation = () => {
    fetch('/getData')
    .then(data => data.json())
    .then((listings) => {this.setState({ data: listings });});
  };

  constructor(props) {
  	super(props);
  }

  componentWillMount() {
    this.getListInformation();
  }


  componentDidMount() {
    this.getListInformation();
    this.setState({ dataLoaded: true});
  }

  render() {
    this.state.data.forEach((listing) => {
      console.log("listing information = " + listing);
      console.log("number of picture" + listing.num_of_profile_picture_uploaded);
    });

    // Please note... render will be called when there is a change in the state?
    console.log("Dashboard component rendering");

  	return (
	  	<>
        <div>
          <h2>Dashboard</h2>
        </div>
	  	</>
  	);
  }

 }