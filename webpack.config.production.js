module.exports = {
  devServer: {
    proxy: {
      '/LS_API': 'https://linkedspaces-api-server.herokuapp.com'
    }
  }
};
