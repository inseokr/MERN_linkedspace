// const { createProxyMiddleware } = require('http-proxy-middleware');
/* Your proxied request is trying to access the local server using the original request path.

Eg, when you request

http://localhost:3000/_api/hello

Your proxy is trying to access

http://localhost:9000/_api/hello

The _api/hello path does not exist on your localhost:9000, which is shown by the Cannot GET /_api/hello error.

You need to rewrite your proxied request paths to remove the _api part:

app.use('/_api', proxy({
    target: 'http://localhost:9000',
    changeOrigin: true,
    pathRewrite: {
        '^/_api' : '/'
    }
})); */
// const proxy = require('http-proxy-middleware');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/LS_API',
    createProxyMiddleware({
      target: 'http://localhost:3000'
    })
  );
};
