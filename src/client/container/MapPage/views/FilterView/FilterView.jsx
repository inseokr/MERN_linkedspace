import React, { useContext, useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import SearchFilter from '../../../../components/Filter/SearchFilter';
import PlaceFilter from '../../../../components/Filter/PlaceFilter';
import PriceFilter from '../../../../components/Filter/PriceFilter';
import { ListingsContext } from '../../../../contexts/ListingsContext';
// import DateFilter from '../../../../components/Filter/DateFilter';

function FilterView() {
    const {filterParams, setFilterParams} = useContext(ListingsContext);
    const search = filterParams["search"];
    const places = filterParams["places"];
    const price = filterParams["price"];
    const [interimSearch, setSearch] = useState(search);
    const [interimPlaces, setPlaces] = useState(places);
    const [interimPrice, setPrice] = useState(price);

    useEffect(() => {
        setFilterParams({ ...filterParams, search: interimSearch})
    }, [interimSearch]);

    useEffect(() => {
        setFilterParams({ ...filterParams, places: interimPlaces})
    }, [interimPlaces]);

    useEffect(() => {
        setFilterParams({ ...filterParams, price: interimPrice})
    }, [interimPrice]);

    return (
        <div>
            <CssBaseline />
            <Grid container direction="row" justify="space-evenly">
                <Grid item xs={4}>
                    <SearchFilter search={search} setSearch={setSearch}/>
                </Grid>
                <Grid item xs={4}>
                    <PlaceFilter places={places} setPlaces={setPlaces}/>
                </Grid>
                <Grid item xs={4}>
                    <PriceFilter price={price} setPrice={setPrice}/>
                </Grid>
                {/*<Grid item xs={3}>*/}
                {/*  <DateFilter/>*/}
                {/*</Grid>*/}
            </Grid>
        </div>
    );
}

export default FilterView;
