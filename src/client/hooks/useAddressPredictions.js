import {
  useCallback, useEffect, useRef, useState
} from 'react';
import { debounce } from 'lodash';
import { loadGoogleMapScript } from '../contexts/helper/helper';

function useAddressPredictions(address) {
  const [predictions, setPredictions] = useState([]);

  const autocomplete = useRef();
  if (!autocomplete.current) {
    loadGoogleMapScript(() => {
      autocomplete.current = new window.google.maps.places.AutocompleteService();
    });
  }

  function getPlacePredictions(input) {
    if (input && input.length > 0) {
      autocomplete.current.getPlacePredictions(
        { input },
        (placePredictions) => {
          if (placePredictions) {
            setPredictions(placePredictions.map(prediction => prediction.description));
          } else {
            setPredictions(null);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  }

  // Used to avoid calling API call on every keypress.
  const debouncedGetPlacePredictions = useCallback(
    debounce(getPlacePredictions, 500), []
  );

  useEffect(() => {
    debouncedGetPlacePredictions(address);
  }, [address]);

  return predictions;
}

export default useAddressPredictions;
