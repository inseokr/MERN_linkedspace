import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchFilter from '../../../../components/Filter/SearchFilter';
import PlaceFilter from '../../../../components/Filter/PlaceFilter';
import PriceFilter from '../../../../components/Filter/PriceFilter';
// import DateFilter from '../../../../components/Filter/DateFilter';

function FilterView(props) {
  const { filterParams, setFilterParams, filters } = props;
  const { search, places, price } = filterParams;
  const [interimSearch, setSearch] = useState(search);
  const [interimPlaces, setPlaces] = useState(places);
  const [interimPrice, setPrice] = useState(price);

  useEffect(() => {
    setFilterParams({ ...filterParams, search: interimSearch });
  }, [interimSearch]);

  useEffect(() => {
    setFilterParams({ ...filterParams, places: interimPlaces });
  }, [interimPlaces]);

  useEffect(() => {
    setFilterParams({ ...filterParams, price: interimPrice });
  }, [interimPrice]);

  return (
    <div>
      <CssBaseline />
      <Grid container direction="row" justify="space-evenly">
        <Grid item xs={4}>
          <div>
            {
              filters.search ? (<SearchFilter search={search} setSearch={setSearch} />) : (<></>)
            }
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            {
              filters.places ? (<PlaceFilter places={places} setPlaces={setPlaces} />) : (<></>)
            }
          </div>
        </Grid>
        <Grid item xs={4}>
          <div>
            {
              filters.price ? (<PriceFilter price={price} setPrice={setPrice} />) : (<></>)
            }
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default FilterView;
