const proxyMiddleWare = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        proxyMiddleWare('/api/v1', {
            target: 'http://168.61.70.118:3000/mock/79',
            changeOrigin: true
        })
    );
};