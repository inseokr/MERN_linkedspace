module.exports = {
    devServer: {
      proxy: {
      '/': 'https://localhost:5000'
      }
    }
};