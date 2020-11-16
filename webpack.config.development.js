module.exports = {
  devServer: {
    proxy: {
      '/LS_API': process.env.REACT_APP_EXPRESS_SERVER_URL
    }
  }
};
