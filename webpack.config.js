/*module.exports = (env) => {
  //return require(`./webpack.config.${env.NODE_ENV}.js`)
  return require('./webpack.config.development.js')
}*/
const { merge } = require('webpack-merge'); //[1]

const commonConfig = require('./webpack.common'); //[2]

module.exports = (env, options) => {
    const config = require('./webpack.config.' + options.mode); //[3]
    return merge(commonConfig, config); //[4]
};
