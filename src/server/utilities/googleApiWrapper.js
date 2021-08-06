const axios = require('axios');

async function fetchGoogleBusiness(cid) {
  const config = {
    params: {
      key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
      cid: cid
    }
  };

  const response = await axios
    .get('https://maps.googleapis.com/maps/api/place/details/json', config)
    .then(response => {
      console.log(response.data.result);
      return response;
    })
    .catch(error => {
      console.log(error);
      return null;
    });

  return response ? response.data.result : null;
}

async function fetchGoogleBusinessPhoto(photoReference) {
  const config = {
    params: {
      key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
      maxwidth: 400,
      photoreference: photoReference
    }
  };

  const response = await axios
    .get('https://maps.googleapis.com/maps/api/place/photo', config)
    .then(response => {
      console.log(response.request);
      return response;
    })
    .catch(error => {
      console.log(error);
      return null;
    });

  return response ? response.request : null;
}

function processPriceLevel(priceLevel) {
  let price = ""; // Translate price level to dollar signs.
  for (let index = 0; index < priceLevel; index++) {
    price += "$";
  }
  return price;
}

module.exports = {
  fetchGoogleBusiness,
  fetchGoogleBusinessPhoto,
  processPriceLevel
};
