import React, { useContext, useEffect, useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';

import { ListingsContext } from '../../../../contexts/ListingsContext';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';

function SearchFilter() {

    const {filterListingsBySearch, search} = useContext(ListingsContext);
    const {currentListing, fetchCurrentListing} = useContext(CurrentListingContext);

    console.log(`(search: ${search}), (currentListing: ${currentListing})`);

    const node = useRef();

    const [showForm, setShowForm] = useState(false);
    const [interimSearch, setSearch] = useState(search);

    useEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    const handleChange = (event) => {
        let value = event.target.value;
        if (value.length === 0) { // Toggle back to default button if value is empty.
            toggleForm();
            value = search; // Default the value of search.
        }
        setSearch(value);
    };

    const onSubmit = (event) => {
        event.preventDefault();
        // if (interimSearch !== search && search.length > 0) {
        //   filterListingsBySearch(interimSearch);
        // }
    };

    const handleClick = (event) => {
        if (node.current.contains(event.target)) {
            // inside click
            return;
        }
        // outside click
        setShowForm(false);
    };

    const searchLabel = search.length > 0 ? search : "Search";

    return (
        <div className={`${showForm ? "blur" : undefined} modal-app`} ref={node}>
            {showForm ? (
                <form onSubmit={(event) => {toggleForm(); onSubmit(event);}}>
                    <TextField id="search-text-field" label="Search" type="search" variant="outlined" size="small" placeholder={interimSearch} onChange={handleChange}/>
                </form>
            ) : (
                <button className="filter-button" onClick={toggleForm}>
                    {searchLabel}
                </button>
            )}
        </div>
    );
}

export default SearchFilter;
