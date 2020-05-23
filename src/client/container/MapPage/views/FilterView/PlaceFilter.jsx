import React, { useContext, useEffect, useRef, useState } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function PlaceFilter() {
  const classes = useStyles();
  const {filterListings, place, price, date} = useContext(ListingsContext);

  const handleChange = (event) => {
    let newPlace = event.target.value;
    console.log("handleChange", newPlace);
    filterListings(newPlace, price, date);
  };

  return (
    <div>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">Place</InputLabel>
        <Select
          value={place}
          onChange={handleChange}
          label="Place"
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          <MenuItem value={"Entire"}>Entire Place</MenuItem>
          <MenuItem value={"Private"}>Private Room</MenuItem>
          <MenuItem value={"Shared"}>Shared Room</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

export default PlaceFilter;
