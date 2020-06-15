import React, {useState, useContext, Component} from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import "../../MapPage/index.css";

import TenantDashboardListView from '../../MapPage/views/ListView/TenantDashboardListView';
import InitiateMap from '../../MapPage/views/MapView/InitiateMap';
import FilterView from '../../MapPage/views/FilterView/FilterView';
import GeneralChatMainPage from '../../GeneralChatPage/GeneralChatMainPage';

import {CurrentListingContext} from '../../../contexts/CurrentListingContext';


export default class TenantListingDashBoard extends Component {
    
    static contextType = CurrentListingContext;

    constructor(props) {
        super(props);

        console.log("props = " + JSON.stringify(props));

        this.state = { rightPaneMode: "map" };
    }

    componentDidMount() {
        console.log("TenantListingDashBoard: componentDidMount")
        
        if(this.props.match!=undefined)
            this.context.fetchCurrentListing(this.props.match.params.id, "tenant");
    }

    componentWillMount() {

        console.log("TenantListingDashBoard: componentWillMount");
        /* load listing information by listing ID */
        // <note> this parameter will contain the value of ":id" in the followinng route path 
        // /listing/landlord/:id
        //this.context.fetchCurrentListing(this.props.match.params.id);
    }

    toggleRightPaneMode()
    {
        if(this.state.rightPaneMode=="Map")
        { 
          this.setState({rightPaneMode: "Message"});
        }
        else
        {
          this.setState({rightPaneMode: "Map"});
        }
    }


    render() {
  
      let rightPane = (this.state.rightPaneMode=="Map")? <InitiateMap /> : <GeneralChatMainPage compact="true"/>

      return (
        <div>
          <Grid component="main">
            <CssBaseline />
            <Box className="App" component="div" display="flex" flexDirection="column">
              <Grid container>
                <Grid item xs={6}>
                  <FilterView/>
                  <Grid item xs={12} alignContent="stretch">
                    <TenantDashboardListView toggle={this.toggleRightPaneMode.bind(this)} mode={this.state.rightPaneMode}/>
                  </Grid>
                </Grid>
                <Grid className="map" item xs={6}>
                  {rightPane}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </div>
      );
    }
}