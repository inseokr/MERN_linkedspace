const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/LS_API',
    createProxyMiddleware({
      target: process.env.EXPRESS_SERVER_URL
    })
  );
};
