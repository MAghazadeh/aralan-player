const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';
console.log(devMode);
module.exports = {
    mode: 'production',
    watch: devMode,
    watchOptions: {
        ignored: /node_modules/,
    },
    entry: {
        'app': './src/app.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js',
    },
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.s[ac]ss$/i,
                include: path.resolve(__dirname, 'src'),
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.(mp3)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'songs',
                    name: '[name].mp3',
                    useRelativePath: true,
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset"
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'fonts',
                    useRelativePaths: true
                }
            },
        ],
    },
    devServer: {
        contentBase: [
            path.join(__dirname, 'dist'),
            path.join(__dirname, 'src'),
        ],
        compress: true,
        port: 9000,
        liveReload: true,
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/app.css'
        }),
        new HtmlWebpackPlugin({
            title: 'Audio Player',
            filename: path.join(__dirname, 'dist/index.html'),
            template: "src/index.html"
        })
    ],
    optimization: {
        minimize: !devMode,
        minimizer: [
            `...`,
            new CssMinimizerPlugin(),
        ],
    },

};