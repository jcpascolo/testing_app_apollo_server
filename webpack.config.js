const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    module: {
        rules: [
        {
            exclude: [ path.resolve(__dirname, 'node_modules') ],
            test: /\.ts$/,
            use: 'ts-loader'
        },
        ],
    },

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: [ '.ts', '.js' ],
    },

    target: 'node'
};