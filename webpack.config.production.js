module.exports = {
  devServer: {
    proxy: {
      '/LS_API': 'http://localhost:3000'
    }
  }
};
