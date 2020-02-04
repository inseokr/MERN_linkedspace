import React, { Component } from 'react';
import './app.css';
import ReactImage from './images/react.png';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './containers/LandingPage/LandingPage';
import ModalLoginForm from './components/Login/ModalLoginForm';

export default class App extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
      <div>
        <CommonHeader/>
        <ModalLoginForm/>
        <LandingPage/>
      </div>
    );
  }
}
