import React, { useContext, useEffect, useRef, useState } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchFilter from './SearchFilter';
import PlaceFilter from './PlaceFilter';
import PriceFilter from './PriceFilter';
import DateFilter from './DateFilter';

function FilterView() {
  const {filteredListings} = useContext(ListingsContext);

  return (
    <div>
      <Grid component="main">
        <CssBaseline />
        <Grid container item={true}>
          <Grid item xs={3}>
            <SearchFilter/>
          </Grid>
          <Grid item xs={3}>
            <PlaceFilter/>
          </Grid>
          <Grid item xs={3}>
            <PriceFilter/>
          </Grid>
          <Grid item xs={3}>
            <DateFilter/>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default FilterView;
