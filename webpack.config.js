const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    mode: 'development',
    entry: './src/index.jsx',
    // 输出
    output: {
        path: __dirname + '/dist',
        filename: 'index.js'
    },
    // 模块
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.m?jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env'],
                  },
                },
              },
        ]
    },
    plugins: [new HtmlWebpackPlugin(
        {
            filename: 'index.html',
            template: '/public/index.html'
        }
    )],
    // 热更新配置
    devServer: {
        static: {
          directory: path.join(__dirname, 'public'),
        },
        port: 9000,
        hot: true,
        open: ['index.html'],
    },
    devtool: 'source-map'
}