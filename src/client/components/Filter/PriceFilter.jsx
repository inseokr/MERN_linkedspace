import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import clsx from 'clsx';
import Modal from '../Modal';

const useStyles = makeStyles(theme => ({
  root: {
    width: 250 + theme.spacing(3) * 2,
  },
  margin: {
    height: theme.spacing(3),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: '10ch',
  },
}));

const LinkedSpacesSlider = withStyles({
  root: {
    color: 'darkgray',
    height: 3,
    padding: '13px 0',
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -12,
    marginLeft: -13,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px',
    },
    '& .bar': {
      // display: inline-block !important;
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  active: {},
  track: {
    height: 3,
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
})(Slider);

function LinkedSpacesThumbComponent(props) {
  return (
    <span {...props}>
      <span className="bar" />
      <span className="bar" />
      <span className="bar" />
    </span>
  );
}

function PriceFilter(props) {
  const classes = useStyles();

  const { price, setPrice } = props;

  const [showModal, setShowModal] = useState(false);
  const [interimPrice, setInterimPrice] = useState(price);
  const [priceSubmitted, setPriceSubmitted] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleChange = (event, newPriceRange) => {
    setInterimPrice(newPriceRange);
  };

  const handleMinChange = (event) => {
    let min = event.target.value;
    const max = interimPrice[1];

    if (!Number.isNaN(Number(min))) { // True if value is a number.
      min = parseInt(min, 10);
      if (min < max) {
        setPrice([min, max]);
      }
    }
  };

  const handleMaxChange = (event) => {
    const min = interimPrice[0];
    let max = event.target.value;

    if (max.slice(-1) === '+') {
      max = max.slice(0, -1); // Remove +
    }

    if (!Number.isNaN(Number(max))) { // True if value is a number.
      max = parseInt(max, 10);
      if (min < max) {
        if (max > 1000) {
          max = 1000; // Change to 1000 if its larger than 1000
        }
        setPrice([min, max]);
      }
    }
  };

  const onSubmit = () => {
    if (interimPrice !== price) {
      setPrice(interimPrice);
    }
    if (!priceSubmitted) {
      setPriceSubmitted(!priceSubmitted);
    }
  };

  const onClear = () => {
    setInterimPrice([1, 1000]);
  };

  const interimMin = interimPrice[0];
  const interimMax = interimPrice[1];

  let priceTitle = 'Price';
  const min = price[0];
  const max = price[1];

  if (priceSubmitted) {
    if (min === 1 && max === 1000) {
      priceTitle = '$1 - $1000+';
    } else if (min === 1) {
      priceTitle = `Up to $${max}`;
    } else if (max === 1000) {
      priceTitle = `$${min}+`;
    } else {
      priceTitle = `$${min} - $${max}`;
    }
  }

  return (
    <div className={`${showModal ? 'blur' : undefined} modal-app`}>
      <button className="filter-button" type="button" onClick={toggleModal}>
        {priceTitle}
      </button>
      {showModal && (
        <Modal toggleModal={toggleModal}>
          <Grid container spacing={5} alignContent="center" alignItems="center" className={classes.root}>
            <Grid item xs={12}>
              <div className="modal-slider">
                <LinkedSpacesSlider
                  ThumbComponent={LinkedSpacesThumbComponent}
                  min={1}
                  max={1000}
                  value={interimPrice}
                  onChange={handleChange}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                />
              </div>
              <div className="modal-min-max-text-fields">
                <TextField
                  label="min price"
                  id="outlined-min-adornment"
                  className={clsx(classes.margin, classes.textField)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={interimMin}
                  onChange={handleMinChange}
                  variant="outlined"
                  size="small"
                />
                <span> - </span>
                <TextField
                  label="max price"
                  id="outlined-max-adornment"
                  className={clsx(classes.margin, classes.textField)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={interimMax >= 1000 ? '1000+' : interimMax}
                  onChange={handleMaxChange}
                  variant="outlined"
                  size="small"
                />
              </div>
            </Grid>
            <Grid item xs={4} className="clear-button-grid">
              <button className="clear-button" type="button" onClick={onClear}>
                Clear
              </button>
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4} className="submit-button-grid">
              <button className="submit-button" type="button" onClick={() => { toggleModal(); onSubmit(); }}>
                Submit
              </button>
            </Grid>
          </Grid>
        </Modal>
      )}
    </div>
  );
}

export default PriceFilter;
