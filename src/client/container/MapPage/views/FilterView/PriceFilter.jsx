import React, { useContext, useEffect, useRef, useState } from 'react';
import Modal from "../../../../components/Modal"
import { ListingsContext } from '../../../../contexts/ListingsContext';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';

function PriceFilter() {
  const {filterListings, places, price, date} = useContext(ListingsContext);

  const [showModal, setShowModal] = useState(false);
  const [interimPrice, setPrice] = useState(price);
  const [priceSubmitted, setPriceSubmitted] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleChange = (event, newPriceRange) => {
    setPrice(newPriceRange);
  };

  const onSubmit = () => {
    if (interimPrice !== price) {
      filterListings(places, interimPrice, date);
    }
    if (!priceSubmitted) {
      setPriceSubmitted(!priceSubmitted);
    }
  };

  const onClear = () => {
    setPrice([1, 1000]);
  };

  let priceTitle = "Price";
  let min = price[0];
  let max = price[1];
  if (priceSubmitted) {
    if (min === 1 && max === 1000) {
      priceTitle = "$1 - $1000+";
    } else if (min === 1) {
      priceTitle = `Up to $${max}`;
    } else if (max === 1000) {
      priceTitle = `$${min}+`;
    } else {
      priceTitle = `$${min} - $${max}`;
    }
  }

  return (
    <div className={`${showModal ? "blur" : undefined} modal-app`}>
      <button className="filter-button" onClick={toggleModal}>
        {priceTitle}
      </button>
      {showModal && (
        <Modal toggleModal={toggleModal}>
          <div>
            <p className="modal-subtitle">Price Range</p>
            <Slider
              min={1}
              max={1000}
              value={interimPrice}
              onChange={handleChange}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
            />
          </div>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <button className="filter-button" onClick={onClear}>
                Clear
              </button>
            </Grid>
            <Grid item xs={6}>
              <button className="filter-button" onClick={() => {toggleModal(); onSubmit();}}>
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
