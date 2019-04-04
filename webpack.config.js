const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    // mode: 'development',
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
        extensions: [ '.ts', '.js' ],
    },
    entry: {
        server: './src/index.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'awesome-typescript-loader',
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto",
            }
        ],
    },
};