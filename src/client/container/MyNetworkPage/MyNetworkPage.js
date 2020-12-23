/* eslint-disable */
import React, { Component } from 'react';
import MyNetworkLeftPane from './MyNetworkLeftPane';
import MyNetworkCenterPane from './MyNetworkCenterPane';
import { GlobalContext } from '../../contexts/GlobalContext';
import './mynetwork_style.css';

export default class MyNetworkPage extends Component {
  static contextType = GlobalContext;

  componentDidMount() {
    //console.log('MyNetworkPage is being loaded');
  }

  componentWillMount() {
    //console.log('MyNetworkPage WillMount called');
    this.context.loadSocialNetworkDb();
  }

  componentWillUnmount() {
    //console.log("MyNetworkPage componentWillUnmount called");
    this.context.refreshUserData();
  }

  render() {
    return (
      <div className="row">
        <div className="col-lg-3">
          <MyNetworkLeftPane />
        </div>
        <div className="col-lg-6">
          <MyNetworkCenterPane />
        </div>
      </div>
    );
  }
}
