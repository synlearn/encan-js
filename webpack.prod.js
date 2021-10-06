const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        filename: '[name]-prod.bundle.js',
    },
    optimization: {
        minimizer: [
        new UglifyJsPlugin({
            cache: true,
            exclude: [/\.min\.js$/gi] // skip pre-minified libs
        }),
        new CompressionPlugin({
            filename: "[path][base].gz",
            compressionOptions: { level: 5 },
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0,
            deleteOriginalAssets: false,
        })
    ]},
});