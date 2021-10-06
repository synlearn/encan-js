const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: '[name].bundle.js',
        library: "encan",
        libraryTarget: "umd",
        clean: false,
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
        ],
    },
};