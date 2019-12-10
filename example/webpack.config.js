const path = require('path');
const output = path.resolve(__dirname, 'dist', 'assets', 'js');
let config = {
    mode: 'development',
    entry: {
        game: './src/main.ts'
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
    }
};

module.exports = (env, argv) => {
    config.devtool = 'source-map';
    return config;
};
