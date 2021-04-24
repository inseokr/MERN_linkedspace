/* eslint-disable */
import React, { useRef, useEffect, useContext, useState } from 'react';
import { Marker } from 'react-leaflet';

function DashboardMarker(props) {
  const { markerSelected } = props;

  const markerRef = useRef();

  useEffect(() => {
    if (markerSelected) {
      markerRef.current.openPopup();
    }
  }, [markerSelected]);

  return (
    <Marker ref={markerRef} {...props}/>
  );
}

export default DashboardMarker;
