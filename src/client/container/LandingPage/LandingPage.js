/* eslint-disable */
import React, { Component } from 'react';
import '../../app.css';
import { STYLESHEET_URL } from '../../globalConstants';
import Home from '../HomePage/Home';
import Dashboard from '../DashboardPage/Dashboard';
import Map from '../MapPage/index';
import Search from '../SearchPage/SearchPage';
import { GlobalContext } from '../../contexts/GlobalContext';

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

export default class LandingPage extends Component {
	// <note> can we have multiple contexts?
	static contextType = GlobalContext;

	state = {
	  lastMenu: '',
	  fetchedMenu: false,
	  loggedIn: 'yes'
	};

	 constructor(props) {
	  	super(props);
	 }

	componentWillMount() {
	  fetch('/LS_API/getLastMenu')
	    .then(res => res.json())
	    .then((menuFromExpress) => {
	      console.log('menuFromExpress:', menuFromExpress);
	      this.setState({ lastMenu: menuFromExpress, fetchedMenu: true });
	    });
	}

	componentDidMount() {
	  const { refreshUserData } = this.context;
	  //console.log(`LandingPage is loaded. search = ${search}`);
	  refreshUserData();
	}

	render() {
	  const { lastMenu } = this.state;

	  let pageToRender = <div />;
	  if (lastMenu === 'map') {
	    console.log('is this even being called', lastMenu);
	    pageToRender = <Map />;
	  } else {
	    pageToRender = (
		  <div>
		    <link
		      rel="stylesheet"
		      href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
		    />
		    <link rel="stylesheet" href={STYLESHEET_URL+"/stylesheets/landing.css"} />
		    <div className="container landingPage">

		      <div className="row landingPage">
		        <div className="col-lg-12">
		          <div className="content">
		            <h1> LinkedSpaces</h1>
		            <h3> Make your next move through a trusted network. </h3>
		            <Search />
		          </div>
		        </div>
		      </div>
		    </div>
		  </div>
	    );
	  }
	  return (
	    pageToRender
	  );
	}
}
