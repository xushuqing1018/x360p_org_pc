const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const fs = require('fs');

fs.open('./src/config/env.js', 'w', function(err, fd) {
    const buf = 'export default "development";';
    //fs.write(fd, buf, 0, buf.length, 0, function(err, written, buffer) {});
});

module.exports = merge(webpackBaseConfig, {
    //devtool: '#source-map',
    output: {
        publicPath: '/dist/',
        filename: '[name].js',
        chunkFilename: '[name].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.js'
        }),
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './src/template/index.ejs',
            inject: false
        }),
        new webpack.ProvidePlugin({
            introJs: ['intro.js', 'introJs']
        })
    ],

    devServer:{
        port:8868,
        proxy: {
            '/api': {
              target: 'http://pro.x360.com',
              pathRewrite: {'^/api' : '/api'},
              changeOrigin: true
            },

            '/static':{
                target:'http://pro.x360.com',
                pathRewrite:{'^/static':'/static'},
                changeOrigin:true
            },
            '/data':{
                target:'http://pro.x360.com',
                pathRewrite:{'^/data':'/data'},
                changeOrigin:true
            },
            '/assets':{
	        	target: 'http://pro.x360.com',
	        	pathRewrite: {'^/assets': '/assets'},
	        	changeOrigin: true
	        }
        }
    }
});