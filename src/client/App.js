import React, { Component } from 'react';
import './app.css';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './container/LandingPage/LandingPage';
import ModalLoginForm from './components/Login/ModalLoginForm';

export default class App extends Component {
  state = { };

  constructor(props) {
    super(props);
  }

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
