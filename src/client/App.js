import React, { Component } from 'react';
import './app.css';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './container/LandingPage/LandingPage';
import GeneralChatMainPage from './container/GeneralChatPage/GeneralChatMainPage';
import ModalLoginForm from './components/Login/ModalLoginForm';
import Map from "./container/MapPage/index";

import {
  BrowserRouter as Router,
  Switch,
  Link
} from "react-router-dom";

import {Redirect, Route} from 'react-router'
import { SearchProvider } from './contexts/SearchContext';

export default class App extends Component {
  state = { };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = 'LinkedSpaces';
  }

  render() {
    return (
      <SearchProvider>
        <Router>
          <CommonHeader/>
          <ModalLoginForm/>
          <Switch>
            <Route exact path="/Map">
              <Map />
            </Route>
            <Route exact path="/Messages">
              <GeneralChatMainPage />
            </Route>
            <Route exact path="/">
              <LandingPage />
            </Route>              
          </Switch>
        </Router>
      </SearchProvider>
    );
  }
}
