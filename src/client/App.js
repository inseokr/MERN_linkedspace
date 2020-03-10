import React, { Component } from 'react';
import './app.css';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './container/LandingPage/LandingPage';
import ModalLoginForm from './components/Login/ModalLoginForm';

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
        <CommonHeader/>
        <ModalLoginForm/>
        <LandingPage/>
      </SearchProvider>
    );
  }
}
