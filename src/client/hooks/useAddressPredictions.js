// /* eslint-disable */
// import {
//   useCallback, useEffect, useRef, useState
// } from 'react';
// import { debounce } from 'lodash';
// import { loadGoogleMapScript } from '../contexts/helper/helper';
//
// function useAddressPredictions(input) {
//   const [predictions, setPredictions] = useState([]);
//
//   const autocomplete = useRef();
//   // if (!autocomplete.current) {
//   //   loadGoogleMapScript(() => {
//   //     // autocomplete.current = new window.google.maps.places.AutocompleteService();
//   //   });
//   // }
//
//   // function getPlacePredictions(placeInput) {
//   //   autocomplete.current.getPlacePredictions(
//   //     { placeInput },
//   //     (placePredictions) => {
//   //       setPredictions(placePredictions.map(prediction => prediction.description));
//   //     }
//   //   );
//   // }
//   //
//   // // Used to avoid calling API call on every keypress.
//   // const debouncedGetPlacePredictions = useCallback(
//   //   debounce(getPlacePredictions, 500),
//   //   []
//   // );
//
//   // useEffect(() => {
//   //   if (autocomplete.current) {
//   //     debouncedGetPlacePredictions(input);
//   //   }
//   // }, [autocomplete.current, input]);
//
//   return [predictions, setPredictions];
// }
//
// export default useAddressPredictions;
