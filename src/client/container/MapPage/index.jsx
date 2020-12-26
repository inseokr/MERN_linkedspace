import React, { useContext, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import ListView from './views/ListView/ListView';
import InitiateMap from './views/MapView/InitiateMap';
import FilterView from './views/FilterView/FilterView';
import GeneralChatMainPage from '../GeneralChatPage/GeneralChatMainPage';
import { ListingsContext } from '../../contexts/ListingsContext';
import './index.css';

function LandingPage() {
  const { filterParams, setFilterParams } = useContext(ListingsContext);
  const [rightPaneMode, setRightPaneMode] = useState('Map');

  function toggleRightPaneMode() {
    if (rightPaneMode === 'Map') {
      setRightPaneMode('Message');
    } else {
      setRightPaneMode('Map');
    }
  }

  const rightPane = (rightPaneMode === 'Map') ? <InitiateMap /> : <GeneralChatMainPage compact="true" />;
  return (

    <div>
      <Grid component="main">
        <CssBaseline />
        <Box className="App" component="div" display="flex" flexDirection="column">
          <Grid container alignContent="stretch">
            <Grid item xs={6}>
              <FilterView
                filterParams={filterParams}
                setFilterParams={setFilterParams}
                filters={{ search: true, places: true, price: true }}
              />
              <Grid item xs={12}>
                <ListView toggle={toggleRightPaneMode} mode={rightPaneMode} />
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

export default LandingPage;
