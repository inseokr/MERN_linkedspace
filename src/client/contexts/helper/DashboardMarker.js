/* eslint-disable */
import React, {useRef, useEffect, useContext} from 'react';
import {Marker} from 'react-leaflet';

import { CurrentListingContext } from '../CurrentListingContext';

const DashboardMarker = props => {

    const { currentChildIndex } = useContext(CurrentListingContext);
    const {markerIndex, markerClickState, markerClickStatehandler} = props;
    
    const markerRef = useRef();

    useEffect(() => {
        if(markerIndex===currentChildIndex && markerIndex!==-1) {
            if(markerClickState===true) {
                markerRef.current.openPopup();
                markerClickStatehandler(false);
            }
        }
    }, [currentChildIndex, markerClickState]);

    return <Marker ref={markerRef} {...props}/>
  }

  export default DashboardMarker;