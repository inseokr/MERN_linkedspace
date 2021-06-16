const axios = require('axios');

async function processYelpBusinessSearch(location, term) {
    let business = {}; // Object with business details.
    let cityCount = {}; // Object with the total occurrences per city.
    let city = ""; // City with the most occurrences.
  
    
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_YELP_API_KEY}`,
      },
      params: {
        location: location,
        term: term,
        limit: 50,
        offset: 0
      }
    };
  
    const response = await axios
        .get('https://api.yelp.com/v3/businesses/search', config)
        .then(response => {
          console.log(response);
          return response;
        })
        .catch(error => {
          console.log(error);
          return null;
        });
  
    if (response) {
      const { data } = response;
      if (data) {
        const { businesses: responseBusinesses } = data;
        if (responseBusinesses) {
          for (const responseBusiness of responseBusinesses) {
            const { alias: responseAlias } = responseBusiness;
            const { city: responseCity } = responseBusiness.location;
            if ([location, term].includes(responseAlias)) { // Business found if alias name matches.
              business = responseBusiness;
              break;
            } else if (responseCity) {
              cityCount[responseCity] = responseCity in cityCount ? cityCount[responseCity] + 1 : 1; // Increment count of each city.
            }
          }
  
          // Logic to determine which city showed up the most out of the response.
          const responseCities = Object.keys(cityCount); // Extract cities out of cityCounter object.
          city = responseCities[0]; // Initialize with the first city.
          for (const responseCity of responseCities) {
            if (cityCount[responseCity] > cityCount[city]) { // Update the city if current city has more occurrences.
              city = responseCity;
            }
          }
        }
      }
    }
  
    return {business: business, city: city};
  }
  
  async function fetchYelpBusinessSearch(alias) {
    const { business, city } = await processYelpBusinessSearch(alias, "food"); // Initially query with alias.
    if (Object.keys(business).length === 0 && city.length > 0) { // Business not found from the initial query.
      const { business } = await processYelpBusinessSearch(city, alias); // Query with alias and city found from initial query.
      return business; // Second query results.
    }
    return business; // First query results.
  }


module.exports = {
    fetchYelpBusinessSearch
};
