import React, { Component } from 'react';
import './app.css';
import Home from './Home';
import Dashboard from './Dashboard';

import {
  BrowserRouter as Router,
  Switch,
  Link
} from "react-router-dom";

import {Redirect, Route} from 'react-router'

// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

// You can think of these components as "pages"
// in your app.
var lastMenu = ""

function About() {
  console.log("About function is called");
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

export default class LandingPage extends Component {
  state = { lastMenuFromExpress : "" };
  loggedIn = "yes";

  getLastMenu = () => {
  	fetch('/getLastMenu')
  	.then(res => res.json())
  	.then(menuFromExpress => {console.log("menuFromExpress = " + menuFromExpress); lastMenu = menuFromExpress})
  }

  componentDidMount() {
  }

  render() {
  	return (
  		<div>
  		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"/>
        <link rel="stylesheet" href="/stylesheets/landing.css"/>
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="content">
                <h1> LinkedSpaces</h1>
                <h3> Make your next move through a trusted network. </h3>
                <hr/>
                <a href="/" class="btn btn-default btn-lg"><i class="fa fa-search"></i> Find your home away from home</a>
              </div>
            </div>
          </div>
        </div>

        <div>
		<Router>
	      <div>
	        <ul>
	          <li>
	            <Link to="/">Home</Link>
	          </li>
	          <li>
	            <Link to="/about">About</Link>
	          </li>
	          <li>
	            <Link to="/dashboard">Dashboard</Link>
	          </li>
	        </ul>

	        <hr />

	        {/*
	          A <Switch> looks through all its children <Route>
	          elements and renders the first one whose path
	          matches the current URL. Use a <Switch> any time
	          you have multiple routes, but you want only one
	          of them to render at a time
	        */}
	        <Switch>
			  <Route exact path="/">
				<Home />
			  </Route>
	          <Route path="/about">
	            <About  />
	          </Route>
	          <Route path="/dashboard">
	            <Dashboard />
	          </Route>
	        </Switch>
	      </div>
	    </Router>
	    </div>

        </div>
  	);
  }
}