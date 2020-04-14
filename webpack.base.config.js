const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const resolve = path.resolve;

const chalk = require('chalk')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });


const cssLoader = {
    loader:'css-loader',
    options:{
        minimize:true
    }
}
const postCssLoader ={
    loader:'postcss-loader'
}

function createHappyPlugin (id, loaders) {
  return new HappyPack({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    // make happy more verbose with HAPPY_VERBOSE=1
    verbose: process.env.HAPPY_VERBOSE === '1'
  })
}

module.exports = {
    entry: {
        main: './src/main',
        vendors: './src/vendors'
    },
    output: {
        path: path.join(__dirname, './dist')
    },
    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {

                        less: ExtractTextPlugin.extract({
                            use: [
                            cssLoader, 
                            postCssLoader, 
                            'less-loader'
                            ],
                            fallback: 'vue-style-loader'
                        }),

                        sass: ExtractTextPlugin.extract({
                            use:[
                            cssLoader,
                            postCssLoader,
                            {loader:'sass-loader',options:{indentedSyntax: true }}
                            ],
                            fallback:'vue-style-loader'
                        }),

                        scss: ExtractTextPlugin.extract({
                            use:[
                            cssLoader,
                            postCssLoader,
                            'sass-loader'
                            ],
                            fallback:'vue-style-loader'
                        }),

                        css: ExtractTextPlugin.extract({
                            use: ['css-loader', postCssLoader],
                            fallback: 'vue-style-loader'
                        }),

                        js:'happypack/loader?id=happy-babel-vue'
                    }
                }
            },
            /*
            {
                test: /iview\/.*?js$/,
                loader: 'babel-loader'
            },
            */
            {
                test: /\.js$/,
                //loader: 'babel-loader',
                loader: 'happypack/loader?id=happy-babel-js',
                exclude: [
                    /node_modules/,
                    path.resolve(__dirname, "iview/dist/iview")
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: [cssLoader, postCssLoader],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.sass$/,
                use: ExtractTextPlugin.extract({
                    use:[cssLoader,postCssLoader,{loader:'sass-loader',options:{indentedSyntax: true }}],
                    fallback:'vue-style-loader'
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use:[cssLoader,postCssLoader,'sass-loader'],
                    fallback:'vue-style-loader'
                })
            },
            {
                test: /\.less/,
                use: ExtractTextPlugin.extract({
                    use: [cssLoader,postCssLoader, 'less-loader'],
                    fallback: 'style-loader'
                })
            },

            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=1024'
            },
            {
                test: /\.(html|tpl)$/,
                loader: 'html-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue','.less','.scss'],
        alias: {
            'vue': 'vue/dist/vue.esm.js',
            '@basic' :resolve('src/views/basic'),
            '@'  : resolve('src'),
            'v%' : resolve('src/views'),
            'c%' : resolve('src/views/components')

        }
    },
    plugins:[
        new ProgressBarPlugin({
          format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
        }),
        createHappyPlugin('happy-babel-js', ['babel-loader?cacheDirectory=true']),
        createHappyPlugin('happy-babel-vue', ['babel-loader?cacheDirectory=true'])
    ]
};