const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    // mode: 'development',
    target: 'node',
    externals: [nodeExternals()],
    plugins: [
        new CopyPlugin([
            { from: './src/models', ignore: ["models.js"] },
        ]),
    ],
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
            },            
        ],
    },
    
};