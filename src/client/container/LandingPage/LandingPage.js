import React, { Component } from 'react';
import '../../app.css';
import Home from '../HomePage/Home';
import Dashboard from '../DashboardPage/Dashboard';
import Map from "../MapPage/index"
import Search from "../SearchPage/SearchPage"

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

function About() {
	console.log("About function is called");
	return (
		<div>
			<h2>About</h2>
		</div>
	);
}

export default class LandingPage extends Component {
	state = {
		lastMenu : "",
		fetchedMenu: false,
		loggedIn : "yes"
	};

	 constructor(props) {
	  	super(props);
	 }

	componentWillMount() {
		console.log("componentWillMount is called!");
		fetch('/getLastMenu')
			.then(res => res.json())
			.then(menuFromExpress => {
					console.log("menuFromExpress:", menuFromExpress);
					this.setState({lastMenu: menuFromExpress, fetchedMenu: true});
				}
			)
	}

	componentDidMount() {
		console.log("componentDidMount is called");
	}

	render() {

		const {lastMenu} = this.state;
		let pageToRender = <></>;
		if (lastMenu === "map") {
			console.log("is this even being called",lastMenu);
			pageToRender = <Map/>
		} else {
			pageToRender = <div>
				<link rel="stylesheet"
							href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"/>
				<link rel="stylesheet" href="/stylesheets/landing.css"/>
				<div className="container landingPage">
					<div className="row landingPage">
						<div className="col-lg-12">
							<div className="content">
								<h1> LinkedSpaces</h1>
								<h3> Make your next move through a trusted network. </h3>
								
								<Router>
								<Search />
								<Switch>
									<Route exact path="/Map">
										<Map />
									</Route>
								</Switch>
								</Router>
							</div>
						</div>
					</div>
				</div>
			</div>
		}
		return (
			pageToRender
		);
	}
}