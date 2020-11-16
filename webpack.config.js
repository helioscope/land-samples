// config docs: https://webpack.js.org/configuration/

const path = require('path');

module.exports = {
  optimization: {
    minimize: false // easier for dev, for now
  },
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: { // dev server config docs: https://webpack.js.org/configuration/dev-server/
    contentBase: './dist', // -- where to serve content from (if using static files, like an index.html)
    port: 1234,
    open: false, // -- to open default browser when started (e.g. via 'npm run start')
    hot: false, // -- for HMR setup. See: https://webpack.js.org/guides/hot-module-replacement/
    liveReload: true, // -- alternative to HMR - just refresh browser when changes are detected
  }
};
