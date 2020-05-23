import React, { useContext, useEffect, useRef, useState } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: 200,
  },
});

function PriceFilter() {
  const classes = useStyles();
  const {filterListings, place, price, date} = useContext(ListingsContext);

  const handleChange = (event, newPriceRange) => {
    filterListings(place, newPriceRange, date);
  };

  return (
    <div className={classes.root}>
      <Typography id="range-slider" gutterBottom>
        Price Range
      </Typography>
      <Slider
        min={1}
        max={1000}
        value={price}
        onChange={handleChange}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
      />
    </div>
  );
}

export default PriceFilter;
