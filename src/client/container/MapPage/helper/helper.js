function constructListingInformationBullets(list) {
  let informationString = '';
  Object.keys(list).forEach((key) => {
    if (list[key]) {
      if (informationString.length > 0) {
        informationString += ` • ${key.replace(/_/g, ' ')}`;
      } else {
        informationString = key.replace(/_/g, ' ');
      }
    }
  });
  return informationString;
}

export default constructListingInformationBullets;
