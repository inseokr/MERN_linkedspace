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
      //console.log(response.data.result);
      return response;
    })
    .catch(error => {
      console.log(error);
      return null;
    });

  return response ? response.data.result : null;
}

async function fetchGooglePlaceByCoordinate(coordinate) {

  function getDistance(a, b) {
    console.warn(`getDistance: a=${JSON.stringify(a)}, b=${JSON.stringify(b)}`);
    let converted = Number.parseFloat(b.lng).toFixed(7);
    console.warn(`converted: ${converted}`);

    let latDistance = Math.abs(Number.parseFloat(a.lat).toFixed(7), Number.parseFloat(b.lat).toFixed(7)); 
    let lngDistance = Math.abs(Number.parseFloat(a.lng).toFixed(7), Number.parseFloat(a.lng).toFixed(7)); 

    return Math.sqrt(Math.pow(latDistance,2)+ Math.pow(lngDistance,2));
  }


  function compareCoordinate(a, b) {

    if((Number.parseFloat(a.lat).toFixed(7)===Number.parseFloat(b.lat).toFixed(7)) &&
       (Number.parseFloat(a.lng).toFixed(7)===Number.parseFloat(b.lng).toFixed(7)) ) {
      //console.warn(`yay... found matching coordinate`);
      return true;
    }
    else
    {
      return false;
    }
  }

  var config = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinate.lat}%2C${coordinate.lng}&radius=10&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`,
    headers: { }
  };

  //console.warn(`fetchGooglePlaceByCoordinate: ${JSON.stringify(config)}`);
  const response = await axios(config)
  .then( async (placeIdResponse) => {
    //console.log(JSON.stringify(placeIdResponse.data.results));
    /*
    {"html_attributions":[],"results":[{"geometry":{"location":{"lat":40.3572976,"lng":-74.6672226},"viewport":{"northeast":{"lat":40.39175483612622,"lng":-74.61750794313994},"southwest":{"lat":40.30487184140339,"lng":-74.72217704480025}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png","icon_background_color":"#7B9EB0","icon_mask_base_uri":"https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet","name":"Princeton","photos":[{"height":1960,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/109335108266697991179\">Animationeer</a>"],"photo_reference":"Aap_uEAX2I06tWPi6yli6dxMSc6VRrMdhkJDzRfFcbuRQLctLodSkzfuWcCTVk0-Ub32flD5-O76OIRwqtnShpAz4EWb2hSZjZeYZxxXIqwyhruxq0r8hZzyXLUqI8wqxbAyxHrrRYDkJkRvxFhPdSCOdYw78jfYC4jn12lf8aY_HiBPTklS","width":4032}],"place_id":"ChIJ8VnQcsHmw4kRwtYTSpNJzT8","reference":"ChIJ8VnQcsHmw4kRwtYTSpNJzT8","scope":"GOOGLE","types":["locality","political"],"vicinity":"Princeton"},{"business_status":"OPERATIONAL","geometry":{"location":{"lat":40.3430942,"lng":-74.65507389999999},"viewport":{"northeast":{"lat":40.35975090000001,"lng":-74.63838315},"southwest":{"lat":40.3261121,"lng":-74.67179695}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/school-71.png","icon_background_color":"#7B9EB0","icon_mask_base_uri":"https://maps.gstatic.com/mapfiles/place_api/icons/v2/school_pinlet","name":"Princeton University","photos":[{"height":1066,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/101594406467166034382\">Rahul Deo Photography</a>"],"photo_reference":"Aap_uEDfrJmg7FUp84kaYbp-64yG-aCHdZTxC0a-4XV9BpvFJ_lAR3zw0P7QqBuYElFIfeUl69wK_rGVCn7QvV9hDXxQYfU3PHwxpsM9kpwonY2_gxyOOM-bnwlr2Q3zanmmApnAB2ywL6iLDzimt-SNXimEiRqzTs8pE1FrWYKfzAAolptx","width":1600}],"place_id":"ChIJ6baYzdjmw4kRTwKQ-tZ-ugI","plus_code":{"compound_code":"88VV+6X Princeton, NJ, USA","global_code":"87G788VV+6X"},"rating":4.6,"reference":"ChIJ6baYzdjmw4kRTwKQ-tZ-ugI","scope":"GOOGLE","types":["university","point_of_interest","establishment"],"user_ratings_total":1370,"vicinity":"Princeton"},{"geometry":{"location":{"lat":40.3435665,"lng":-74.65431559999999},"viewport":{"northeast":{"lat":40.34472710318555,"lng":-74.65363222455395},"southwest":{"lat":40.34202914260256,"lng":-74.65633018513697}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","icon_background_color":"#7B9EB0","icon_mask_base_uri":"https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet","name":"Poe Field","place_id":"ChIJO59gDMXmw4kR9LN3B9pDxh0","reference":"ChIJO59gDMXmw4kR9LN3B9pDxh0","scope":"GOOGLE","types":["premise","point_of_interest","establishment"],"vicinity":"Princeton"}],"status":"OK"}
    */
   /*
   [{"geometry":{"location":{"lat":40.3572976,"lng":-74.6672226},"viewport":{"northeast":{"lat":40.39175483612622,"lng":-74.61750794313994},"southwest":{"lat":40.30487184140339,"lng":-74.72217704480025}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png","icon_background_color":"#7B9EB0","icon_mask_base_uri":"https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet","name":"Princeton","photos":[{"height":1960,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/109335108266697991179\">Animationeer</a>"],"photo_reference":"Aap_uEB1fHwipo8Rlg-xOa_AZRFSeY3T3QQ4Aga4d2r86BKIQeaugxPAgF2vOhp04V-exbmpuV4W1lOcpYTPLd9Izha0AOE74AfpH2YTN_C3N-714RodOx0vjSiA7CslxyqjVWX1FT4vyKdoEDkwvoP2PEZ230rpJgA_-nUF-CkWXIgEygOq","width":4032}],"place_id":"ChIJ8VnQcsHmw4kRwtYTSpNJzT8","reference":"ChIJ8VnQcsHmw4kRwtYTSpNJzT8","scope":"GOOGLE","types":["locality","political"],"vicinity":"Princeton"},{"geometry":{"location":{"lat":40.3435665,"lng":-74.65431559999999},"viewport":{"northeast":{"lat":40.34472710318555,"lng":-74.65363222455395},"southwest":{"lat":40.34202914260256,"lng":-74.65633018513697}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png","icon_background_color":"#7B9EB0","icon_mask_base_uri":"https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet","name":"Poe Field","place_id":"ChIJO59gDMXmw4kR9LN3B9pDxh0","reference":"ChIJO59gDMXmw4kR9LN3B9pDxh0","scope":"GOOGLE","types":["premise","point_of_interest","establishment"],"vicinity":"Princeton"}]
   */
    let numOfResults = placeIdResponse.data.results.length;
    let minDistance = -1;
    let indexWithMinimumDistance = 0;

    if(numOfResults>0) {
      // Pick a place closer to the target coordinate
      // <note> There could be places sharing the same coordinate.
      // In this case, we should compare the business name as well.
      for(let index=0; index<numOfResults; index++ ) {
        let bMatch = compareCoordinate(coordinate,placeIdResponse.data.results[index].geometry.location);    
        if(bMatch===true) {
          indexWithMinimumDistance=index;
          break;
        }
      }

      return placeIdResponse.data.results[indexWithMinimumDistance];
      /* 
       * <note> nearby API already contains all the details for the place.
       * No need to call this API anymore.
      let placeId = placeIdResponse.data.results[indexWithMinimumDistance].place_id;
      //console.log(`Place ID: ${placeId}`);
      config = {
        params: {
          key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
          place_id: placeId
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
    
      return response ? response.data.result : null;*/
    }
    else {
      console.warn(`No place found with given coordinate`);
      return null;
    }
  })
  .catch(function (error) {
    console.log(error);
  });

  return response;
 
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
      //console.log(response.request);
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
  fetchGooglePlaceByCoordinate,
  processPriceLevel
};
