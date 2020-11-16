module.exports = {
  devServer: {
    proxy: {
      '/LS_API': process.env.EXPRESS_SERVER_URL
    }
  }
};
