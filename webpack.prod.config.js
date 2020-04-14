const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); 
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const fs = require('fs');

fs.open('./src/config/env.js', 'w', function(err, fd) {
    const buf = 'export default "production";';
    fs.write(fd, buf, 0, buf.length, 0, function(err, written, buffer) {});
});

// the path(s) that should be cleaned
let pathsToClean = [
  'release'
]

// the clean options to use
let cleanOptions = {
  root:     path.join(__dirname,'./'),
  exclude:  [],
  verbose:  true,
  dry:      false
}

module.exports = merge(webpackBaseConfig, {
    output: {
        path: path.join(__dirname, './release/dist'),
        publicPath: '/ui/pc/dist/', 
        // publicPath: '/ui/neza/pc/dist/',
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].chunk.js'
    },
    plugins: [
        new CleanWebpackPlugin(pathsToClean, cleanOptions),
        new ExtractTextPlugin({
            filename: '[name].[contenthash].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.[chunkhash].js'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.ProvidePlugin({
            introJs: ['intro.js', 'introJs']
        }),
        /*
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),*/
        new ParallelUglifyPlugin({
           cacheDir: '.cache/',
           uglifyJS:{
             output: {
               comments: false
             },
             compress: {
               warnings: false
             }
           }
        }),
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './src/template/index.ejs',
            inject: false
        })
    ]
});