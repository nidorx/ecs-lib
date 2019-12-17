const path = require('path');
const output = path.resolve(__dirname, 'dist', 'assets', 'js');
const CopyPlugin = require('copy-webpack-plugin');
let config = {
    mode: 'development',
    entry: {
        game: './src/main.tsx'
    },
    output: {
        path: output,
        filename: '[name].bundle.js',
        publicPath: 'assets/js'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        contentBase: [path.join(__dirname, 'public')]
    },
    plugins: [
        new CopyPlugin([
            {
                from: path.resolve(__dirname, 'public'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
    ],
};

module.exports = (env, argv) => {
    config.devtool = 'source-map';
    return config;
};
