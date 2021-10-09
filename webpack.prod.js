const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        filename: '[name]-prod.bundle.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            __LOCAL__: 0,
        })],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                exclude: [/\.min\.js$/gi],// skip pre-minified libs,
            }),
            new CompressionPlugin({
                filename: "[path][base].gz",
                compressionOptions: {level: 5},
                algorithm: "gzip",
                test: /\.js$|\.css$|\.html$/,
                threshold: 10240,
                minRatio: 0,
                deleteOriginalAssets: false,
            }),


            new TerserPlugin({
                minify: TerserPlugin.terserMinify,
                terserOptions: {
                    mangle: true, // Note `mangle.properties` is `false` by default.
                    module: true,
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ]
    },
});