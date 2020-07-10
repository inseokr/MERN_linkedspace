import React, { Component } from 'react';
import './app.css';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './container/LandingPage/LandingPage';
import GeneralChatMainPage from './container/GeneralChatPage/GeneralChatMainPage';
import MyNetworkPage from './container/MyNetworkPage/MyNetworkPage';
import ModalLoginForm from './components/Login/ModalLoginForm';
import Map from "./container/MapPage/index";
import ListingLandlordMainPage from "./container/ListingPage/landlord/ListingLandlordMainPage";
import ListingTenantMainPage from "./container/ListingPage/tenant/ListingTenantMainPage";
import TenantListingDashboard from "./container/ListingPage/tenant/TenantListingDashboard";
import ShowActiveListingPageWrapper   from "./container/ListingPage/ShowActiveListingPageWrapper";
import PostListingPage         from "./container/ListingPage/PostListingPage";
import Post3rdPartyListing     from "./container/ListingPage/3rdParty/Post3rdPartyListing";

import {
  BrowserRouter as Router,
  Switch,
  Link
} from "react-router-dom";

import { Redirect, Route }        from 'react-router';

import { MessageContextProvider } from './contexts/MessageContext';
import { GlobalProvider }         from './contexts/GlobalContext';
import { ListingsProvider }       from './contexts/ListingsContext';
import { CurrentListingProvider } from './contexts/CurrentListingContext';

export default class App extends Component {
  state = { };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = 'LinkedSpaces';

    console.log("App componentDidMount");
    console.log("props = " + JSON.stringify(this.props));
  }

  render() {
    console.log("WDFWDCWEDISDWEKRIWEDWED", this.state);
    return (
      <GlobalProvider>
        <ListingsProvider>
          <CurrentListingProvider>
            <MessageContextProvider>
              <Router>
                <CommonHeader/>
                <ModalLoginForm/>
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
                  <Route exact path="/">
                    <LandingPage />
                  </Route>
                  <Route exact path="/PostListing">
                    <PostListingPage />
                  </Route>
                  <Route exact path="/3rdParty">
                    <Post3rdPartyListing />
                  </Route>
                  <Route exact path="/ActiveListing">
                    <ShowActiveListingPageWrapper type="own" listingControl="" />
                  </Route>
                  <Route exact path="/ShowListingFromFriends">
                    <ShowActiveListingPageWrapper type="friend" listingControl=""/>
                  </Route>
                  <Route path={"/listing/landlord/:id"} component={ListingLandlordMainPage} />
                  <Route path={"/listing/tenant/:id/get"} component={ListingTenantMainPage} />
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
