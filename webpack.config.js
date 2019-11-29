const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: './src/index.ts',
    devtool: 'eval-source-map',
    output: {
        publicPath: '',
        path: path.resolve(__dirname, 'dist'),
        filename: './assets/js/[name].[hash:8].js'
    },
    resolve: {
        extensions: ['.js', '.ts', '.scss'],
        alias: {
            // css: path.resolve(__dirname, './src/styles'),
            imgs: path.resolve(__dirname, './src/assets/imgs'),
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: path.resolve(__dirname, 'node_modules'),
                include: path.resolve(__dirname, 'src'),
                loader: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    // {loader: "style-loader"},
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            //    importLoaders: 1
                        }
                    },
                    {       // 自动添加前缀
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')
                            ]
                        }
                    }, {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 100,
                    name: './imgs/[name].[hash:7].[ext]',
                }
            }

        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([{
            from: path.join(__dirname, './src/assets'),
            to: path.join(__dirname, './dist/assets'),
        }]),
        new MiniCssExtractPlugin({
            filename: './assets/styles/index.[hash:8].css'
        }),

        new HtmlWebpackPlugin({
            // favicon: './src/img/favicon.ico',
            title: '磁铁布局',
            template: './src/index.html',
            filename: 'index.html',
            minify: {       // 压缩
                removeComments: true,       // 移除HTML中的注释
                collapseWhitespace: true,        // 删除空白符与换行符
                removeAttributeQuotes: true        // 去除属性引用
            }
        })
    ],
    devServer: {
        host: '0.0.0.0',
        port: 8083,
        open: true,
        proxy: {
            '/oneportal': {
                target: 'http://192.168.100.254:9300/',
                // pathRewrite: { '^/api': '' },
                changeOrigin: true
            }
        }
    }
};