/* eslint-disable */
import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import Tooltip from '@material-ui/core/Tooltip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import useAddressPredictions from '../../hooks/useAddressPredictions';
import { getGeometryFromSearchString } from '../../contexts/helper/helper';

function CollectLocationInfo(props) {
  const {currentAddress} = props;
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [addressInput, setAddressInput] = useState(currentAddress);
  const predictions = useAddressPredictions(addressInput);

  function updateLocationJQuery(street, city, state, zipcode, country, lat, lng) {
    $('#street').val(street);
    $('#city').val(city);
    $('#state').val(state);
    $('#zipcode').val(zipcode);
    $('#country').val(country);
    $('#lat').val(lat);
    $('#lng').val(lng);
  }

  function processAddressValues(address) {
    console.log('processAddressValues called.', address);
    getGeometryFromSearchString(address).then((response) => {
      const { results, status } = response;
      if (status === 'OK') {
        const result = results[0];
        const { address_components: addressComponents, geometry } = result;
        const { lat, lng } = geometry.location;

        const addressValues = { // Initiate Empty Address Components.
          street_number: '',
          route: '',
          locality: '',
          administrative_area_level_1: '',
          country: '',
          postal_code: '',
        };
        const addressKeys = Object.keys(addressValues);

        console.log('addressComponents', JSON.stringify(addressComponents, null, 2));

        addressComponents.forEach((addressComponent) => {
          const { long_name: longName, short_name: shortName, types } = addressComponent;
          types.forEach((addressType) => {
            if (addressKeys.includes(addressType)) {
              if (['administrative_area_level_1', 'country'].includes(addressType)) {
                addressValues[addressType] = shortName;
              } else {
                addressValues[addressType] = longName;
              }
            }
          });
        });

        const street = (addressValues.street_number.length > 0 && addressValues.route.length > 0) ? `${addressValues.street_number} ${addressValues.route}` : '';

        if (addressValues.locality.length > 0) {
          updateLocationJQuery(
            street,
            addressValues.locality,
            addressValues.administrative_area_level_1,
            addressValues.postal_code,
            addressValues.country,
            lat,
            lng
          );
        } else { // Invalid number of keys, therefore invalid address.
          setAddressInput('');
          setLocation(null);
          setCoordinates(null);
          alert('Invalid address components.');
        }
      }
    });
  }

  function processAddressInput(locationValues) {
    try {
      let address = '';

      locationValues.forEach((locationValue) => {
        if (locationValue.length > 0) {
          address += `${locationValue}, `;
        }
      });

      address = address.replace(/,\s*$/, ''); // Remove last comma and trailing spaces.

      return address;
    } catch (err) {
      console.warn(err);
      return '';
    }
  }

  useEffect(() => {
    if (predictions) { // Prediction found. See if a prediction matches the address input.
      predictions.forEach((prediction) => {
        if (prediction === addressInput) {
          processAddressValues(prediction);
        }
      });
    } else if (addressInput.length === 0) { // Clear if addressInput is empty.
      setAddressInput('');
      setLocation(null);
      setCoordinates(null);
      alert('Please enter a valid address.');
    }
  }, [addressInput, predictions]);

  useEffect(() => {
    if (location && coordinates) {
      const {
        street, city, state, zipcode, country
      } = location;
      const { lat, lng } = coordinates;
      updateLocationJQuery(street, city, state, zipcode, country, lat, lng);
      setAddressInput(processAddressInput([street, city, state, zipcode, country]));
    }
  }, [location, coordinates]);

  useEffect(() => {
    if (props !== undefined && props.location !== undefined && location == null) {
      setLocation(props.location);
    }
    if (props !== undefined && props.coordinates !== undefined && coordinates == null) {
      setCoordinates(props.coordinates);
    }
  }, []);

  return (
    <div>
      <Tooltip title="If address is not available, please provide a nearby location. (ex. street, restaurant, landmark, etc)" placement="right">
        <Autocomplete
          id="address-input"
          freeSolo
          options={predictions || []}
          getOptionLabel={option => option}
          style={{ width: '90%' }}
          key={!predictions}
          value={addressInput || ''}
          renderInput={params => (
            <TextField
              required
              {...params}
              label="Address"
              variant="outlined"
              onChange={event => setAddressInput(event.target.value)}
            />
          )}
          onChange={(event, value) => setAddressInput(value || '')}
          onBlur={() => processAddressValues(addressInput)}
        />
      </Tooltip>
      {/* https://github.com/inseokr/MERN_linkedspace/issues/359 */}
      <input className="form-control" type="hidden" required="required" name="location[street]" id="street" placeholder="Street" />
      <input className="form-control" type="hidden" required="required" name="location[city]" id="city" placeholder="City" />
      <input className="form-control" type="hidden" required="required" name="location[state]" id="state" placeholder="State" />
      <input className="form-control" type="hidden" required="required" name="location[zipcode]" id="zipcode" placeholder="ZipCode" />
      <input className="form-control" type="hidden" required="required" name="location[country]" id="country" placeholder="Country" />
      <input className="form-control" type="hidden" required="required" name="coordinates[lat]" id="lat" placeholder="0.00" />
      <input className="form-control" type="hidden" required="required" name="coordinates[lng]" id="lng" placeholder="0.00" />
      {/* This is a temporary fix. Need to pass data another way. */}
    </div>
  );
}

export default CollectLocationInfo;
