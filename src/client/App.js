import React, { Component } from 'react';
import './app.css';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './container/LandingPage/LandingPage';
import GeneralChatMainPage from './container/GeneralChatPage/GeneralChatMainPage';
import MyNetworkPage from './container/MyNetworkPage/MyNetworkPage';
import ModalLoginForm from './components/Login/ModalLoginForm';
import Signup from './components/Login/Signup';
import Logout from './components/Login/Logout';
import Map from "./container/MapPage/index";
import ListingLandlordMainPage from "./container/ListingPage/landlord/ListingLandlordMainPage";
import ListingTenantMainPage from "./container/ListingPage/tenant/ListingTenantMainPage";
import TenantListingDashboard from "./container/ListingPage/tenant/TenantListingDashboard";
import ShowActiveListingPageWrapper   from "./container/ListingPage/ShowActiveListingPageWrapper";
import PostListingPage         from "./container/ListingPage/PostListingPage";
import Post3rdPartyListing     from "./container/ListingPage/3rdParty/Post3rdPartyListing";
import EditProfileMain         from "./container/EditProfilePage/EditProfileMain";

import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";

import { Route }        from 'react-router';

import { MessageContextProvider }        from './contexts/MessageContext';
import { GlobalProvider, GlobalContext } from './contexts/GlobalContext';
import { ListingsProvider }              from './contexts/ListingsContext';
import { CurrentListingProvider }        from './contexts/CurrentListingContext';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {showLoginModal: false,
                  loggedInStatus: false };
  }

  clickHandler() {
      console.log("loginClickHander called");
      this.setState({showLoginModal: true});
  }

  updateLoginStatus(status) {

    console.log("updateLoginStatus: status = " + status);

    this.setState({loggedInStatus: status});
  }

  componentDidMount() {
    document.title = 'LinkedSpaces';

    console.log("App componentDidMount");
    console.log("props = " + JSON.stringify(this.props));
  }

  render() {
    return (
      <GlobalProvider>
        <ListingsProvider>
          <CurrentListingProvider>
            <MessageContextProvider>
              <Router>
                <CommonHeader loginClickHandler={this.clickHandler.bind(this)} updateLoginStatus={this.updateLoginStatus.bind(this)}/>
                <ModalLoginForm display={this.state.showLoginModal}/>
                <Switch>
                  <Route exact path="/Map">
                    <Map/>
                  </Route>
                  <Route exact path="/Messages">
                    <GeneralChatMainPage compact="false"/>
                  </Route>
                  <Route exact path="/MyNetworks">
                    <MyNetworkPage />
                  </Route>

                  <Route exact path="/PostListing">
                    <PostListingPage />
                  </Route>
                  <Route exact path="/Signup">
                    <Signup />
                  </Route>
                  <Route exact path="/Logout">
                    <Logout />
                  </Route>
                  <Route exact path="/EditProfile">
                    <EditProfileMain />
                  </Route>

                  <Route exact path="/">
                    <LandingPage />
                  </Route>

                  <Route exact path="/homepage">
                    <LandingPage />
                  </Route>

                  <Route exact path="/3rdParty" component={Post3rdPartyListing} />

                  <Route exact path="/ActiveListing">
                    <ShowActiveListingPageWrapper type="own" listingControl="" />
                  </Route>
                  <Route exact path="/ShowListingFromFriends">
                    <ShowActiveListingPageWrapper type="friend" listingControl=""/>
                  </Route>
                  <Route path={"/listing/landlord/:id/get"} render={(props)=> <ListingLandlordMainPage {...props} isLoggedIn={this.state.loggedInStatus}/>} />
                  <Route path={"/listing/tenant/:id/get"} render={(props)=> <ListingTenantMainPage {...props} isLoggedIn={this.state.loggedInStatus}/>} />
                  <Route
                    path={"/listing/tenant/:id/dashboard"}
                    render={({
                      match
                    }) => (
                      <TenantListingDashboard match={match} />
                    )}
                  />
                </Switch>
              </Router>
            </MessageContextProvider>
          </CurrentListingProvider>
        </ListingsProvider>
      </GlobalProvider>
    );
  }
}
