
const glob = require('glob');

const webpackConfiguration = {
  entry: glob.sync('./src/**/*'),
};

console.log(webpackConfiguration);


module.exports = webpackConfiguration;