const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    plugins: [
        new webpack.DefinePlugin({
            __LOCAL__: 1,
        })],
    watchOptions: {
        poll: true,
        ignored: "/node_modules/"
    }
});