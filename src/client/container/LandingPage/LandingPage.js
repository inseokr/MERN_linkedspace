/* eslint-disable */
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import '../../app.css';
import './LandingPage.css';
import { FILE_SERVER_URL } from '../../globalConstants';
import Home from '../HomePage/Home';
import Dashboard from '../DashboardPage/Dashboard';
import Map from '../MapPage/index';
import Search from '../SearchPage/SearchPage';
import { GlobalContext } from '../../contexts/GlobalContext';
import TenantIntro from './TenantIntro';
import VacationIntro from './VacationIntro';
import DashboardIntro from './DashboardIntro';
import MiddlemenIntro from './MiddlemenIntro';
import $ from 'jquery';
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
    lastMenu: null,
    fetchedMenu: false,
    loggedIn: 'yes'
  };

  constructor(props) {
    super(props);

    this.handleSignupClick = this.handleSignupClick.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
    const { refreshUserData } = this.context;
    refreshUserData();
  }

  handleSignupClick() {
    //console.log('handleSignupClick');
    const { signupClickHandler } = this.props;
    signupClickHandler();
  }

  render() {
    const redirectUrl = sessionStorage.getItem('redirectUrlAfterLogin');
    console.warn("redirectUrl = " + redirectUrl);

    let pageToRender = <div />;
    let bgFileUrl = "/public/user_resources/pictures/airbnb_bg_1.jpg";

    let landingPageStyle = {
      backgroundImage: `url(${FILE_SERVER_URL}${bgFileUrl}`,
      minHeight: "89vh",
      minWidth: "100%"
    }

    let noLoginComponents = (this.context.isUserLoggedIn()===false) ? 
      <React.Fragment>
      <TenantIntro handleSignupClick={this.handleSignupClick}/>
      <VacationIntro handleSignupClick={this.handleSignupClick}/>
      <MiddlemenIntro handleSignupClick={this.handleSignupClick}/>
      <DashboardIntro handleSignupClick={this.handleSignupClick}/>
      </React.Fragment> :
      <React.Fragment></React.Fragment>;

    if (redirectUrl !== null && this.context.isUserLoggedIn()===false) {
      console.log('is this even being called', redirectUrl);
      pageToRender = <Redirect to={redirectUrl} />;
      sessionStorage.removeItem('redirectUrlAfterLogin');
      console.log('after removal = '+ sessionStorage.getItem('redirectUrlAfterLogin'));

    } else {
      pageToRender = (
        <div >
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
          />
          <div className="container landingPage" style={landingPageStyle}>
            <div className="row landingPage">
              <div className="col-lg-12">
                <div className="content" style={{marginTop:'0px'}}>
                  <section style={{fontSize: '7em', 
                                   fontWeight: '700', 
                                   color:  'white'}}> 
                    LinkedSpaces
                  </section>
                  <section style={{fontSize: '3em', 
                                   fontWeight: '700', 
                                   color: 'white', 
                                   marginTop: '0px'}}>
                    Make your next move through a trusted network
                  </section>
                  <Search />
                </div>
              </div>
            </div>
          </div>
          {noLoginComponents}
          <div className="_lsFont2" style={{borderTopStyle: 'none', textAlign: 'left', marginTop: '10px'}}> 
          <section style={{marginTop: '10px', minHeight: '30px'}}> © 2021 LinkedSpaces, Inc. All rights reserved</section> </div>
        </div>
      );
    }
    return (
      pageToRender
    );
  }
}
