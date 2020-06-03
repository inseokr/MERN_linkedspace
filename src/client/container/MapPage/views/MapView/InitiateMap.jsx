import React, { useContext, useState, useEffect } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import Map from './Map'

function InitiateMap(props) {
  const {mapLoaded} = useContext(ListingsContext);

  return (
    <div className="App">
      {mapLoaded ? <Map/> : <div>Loading...</div>}
    </div>
  );
}

export default InitiateMap;
