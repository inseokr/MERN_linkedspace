import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { ListingsContext } from '../../contexts/ListingsContext';
import './SearchPage.css';

function Search() {
  const { filterParams, setFilterParams } = useContext(ListingsContext);
  const [query, setQuery] = useState('');
  const [enterKeyPressed, setEnterKeyPressed] = useState(false);

  const handleInputChange = (event) => {
    const input = event.target.value;
    if (input) {
      setQuery(input);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const searchQuery = query.length > 0 ? query : 'Fremont, CA, USA';
      setFilterParams({ ...filterParams, search: searchQuery });
      setEnterKeyPressed(true);
    }
  };

  return (
    <div>
      {enterKeyPressed ? (<Redirect to="/Map" />) : (
        <form className="btn btn-default btn-lg">
          <i className="fa fa-search searchIcon" />
          <input
            className="searchInput"
            placeholder="City, State, Country"
            onKeyDown={event => handleKeyDown(event)}
            onChange={event => handleInputChange(event)}
          />
        </form>
      )}
    </div>
  );
}

export default Search;
