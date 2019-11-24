import React, { Component } from 'react';
import './app.css';
import ReactImage from './react.png';
import CommonHeader from './CommonHeader';
import LandingPage from './LandingPage';
import ModalLoginForm from './ModalLoginForm';
export default class App extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
      <div>
        <CommonHeader />
        <ModalLoginForm />
        <LandingPage />
      </div>
    );
  }
}
