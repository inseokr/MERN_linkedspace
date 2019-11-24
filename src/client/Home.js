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

export default class Home extends Component {
  
  constructor(props) {
  	super(props);

  	this.state = {
  		lastMenu: "",
  		fetchedMenu: false
  	}
  }

  componentWillMount() {

  	console.log("componentWillMount is called");

  	fetch('/getLastMenu')
  	.then(res => res.json())
  	.then(menuFromExpress => {
  		console.log("menuFromExpress = " + menuFromExpress);
  		this.setState({lastMenu: menuFromExpress, fetchedMenu: true});
		}
  	)
  }

  componentDidMount() {
  	console.log("componentDidMount is called");
  }

  render() {

  	// ISEO: how can I show home when fetchedMenu fails?
  	//if(this.state.fetchedMenu==false) return null;
  	if(this.state.fetchedMenu==false) return (<> <div> <h2> Home </h2> </div> </>);;

  	let output;

  	console.log("Home Component is about to render");

  	if(this.state.lastMenu=="about") {
  		output = <Redirect to='/about' />;
  	} else if (this.state.lastMenu=="dashboard") {
  		output = <Redirect to='/dashboard' />;
  	} else 	{
  		output = <div> <h2> Home </h2> </div>;
  	}

  	return (
	  	<>
	  		{output}
	  	</>
  	);
  }

 }