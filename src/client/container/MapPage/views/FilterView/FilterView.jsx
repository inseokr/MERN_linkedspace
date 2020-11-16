import React from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchFilter from './SearchFilter';
import PlaceFilter from './PlaceFilter';
import PriceFilter from './PriceFilter';
import DateFilter from './DateFilter';

function FilterView() {
    return (
        <div>
            <CssBaseline />
            <Grid container direction="row" justify="space-evenly">
                <Grid item xs={4}>
                    <SearchFilter/>
                </Grid>
                <Grid item xs={4}>
                    <PlaceFilter/>
                </Grid>
                <Grid item xs={4}>
                    <PriceFilter/>
                </Grid>
                {/*<Grid item xs={3}>*/}
                {/*  <DateFilter/>*/}
                {/*</Grid>*/}
            </Grid>
        </div>
    );
}

export default FilterView;
