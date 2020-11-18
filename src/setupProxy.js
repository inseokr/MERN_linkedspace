const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  console.log(`createProxyMiddleware: redirect server URL = ${process.env.REACT_APP_EXPRESS_SERVER_URL}`);

  const serverUrl = (process.env.REACT_APP_NODE_ENV === 'development')
    ? 'http://localhost:3000' : process.env.REACT_APP_EXPRESS_SERVER_URL;

  app.use(
    '/LS_API',
    createProxyMiddleware({
      target: serverUrl,
      changeOrigin: true
    })
  );
};
