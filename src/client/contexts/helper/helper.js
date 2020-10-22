// Functions related to the map

async function getGeometryFromSearchString(search, apiKey) {
    return await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${apiKey}`)
        .then((response) => response.json())
        .then((responseJson) => {
            return responseJson;
        });
}

export {getGeometryFromSearchString};
