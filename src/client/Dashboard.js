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

export default class Dashboard extends Component {
  
  constructor(props) {
  	super(props);
  }



  render() {

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