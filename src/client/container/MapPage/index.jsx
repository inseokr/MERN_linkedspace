import React from 'react';
import './index.css';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import ListView from './views/ListView/ListView';
import InitiateMap from './views/MapView/InitiateMap';
import FilterView from './views/FilterView/FilterView';

function LandingPage() {
  return (
    <div>
      <Grid component="main">
        <CssBaseline />
        <Box className="App" component="div" display="flex" flexDirection="column">
          <Grid container>
            <Grid item xs={6}>
              <FilterView/>
              <Grid item xs={12} alignContent="stretch">
                <ListView/>
              </Grid>
            </Grid>
            <Grid className="map" item xs={6}>
              <InitiateMap/>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </div>
  );
}

export default LandingPage;
