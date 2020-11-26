/* eslint-disable */
import React, { Component } from 'react';
import '../../app.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from 'react-router-dom';


const lastMenu = '';

// ISEO: Please refer the following link
// https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274

export default class Dashboard extends Component {
  state = {
    data: [],
    dataLoaded: false
  };

  getListInformation = () => {
    fetch('/LS_API/getData')
      .then(data => data.json())
      .then((listings) => { this.setState({ data: listings, dataLoaded: true }); });
  };

  constructor(props) {
  	super(props);
  }

  componentDidMount() {
    this.getListInformation();
  }

  render() {
    const items = this.state.data.map((listing, i) => (
      <li>
        {' '}
        requester name =
        {listing.requester.username}
      </li>
    ));


  	return (
    <div>
      <h2>Dashboard</h2>
      {this.state.dataLoaded === true
              && (
              <ul>
                {items}
              </ul>
              )
            }
    </div>
  	);
  }
}
