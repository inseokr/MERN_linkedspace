const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  console.log(`createProxyMiddleware: redirect server URL = ${process.env.REACT_APP_EXPRESS_SERVER_URL}`);
  app.use(
    '/LS_API',
    createProxyMiddleware({
      target: process.env.REACT_APP_EXPRESS_SERVER_URL,
      changeOrigin: true
    })
  );
};
