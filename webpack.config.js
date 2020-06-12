const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';
const fileName = ext => isProd ? `bundle.[hash].${ext}` : `bundle.${ext}`;

module.exports = {
    // где лежат исходники приложения в папке я src
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    // уже в папке src, указывыаю относительно нее,
    // @babel/polyfill чтобы убрать ошибку с асинк "regeneratorRuntime is not defined"
    entry: ['@babel/polyfill', './app/index.js'],
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.css', '.scss'],
        // искать файлы в src для того чтобы не писать ../../../
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@core': path.resolve(__dirname, 'src/core')
        }
    },
    plugins: [
        // создаю html с вставленным js и css
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: isProd
        }),
        // чистит dist по умолчанию
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: 'assets', to: 'assets' },
                { from: path.resolve(__dirname, 'src/favicon.ico'), to: './' },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: fileName('css'),
        })
    ],
    devtool: isProd ? false : 'source-map',
    devServer: {
        port: 3000,
        hot: !isProd,
        compress: true,
        // before(app) {
        //     app.use(compression({}));
        // },
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true,
                            publicPath: './',
                            hmr: !isProd,
                        },
                    },
                    'css-loader',
                    {
                        loader: `postcss-loader`,
                        options: {
                            options: {},
                        }
                    },
                    'sass-loader',
                ],
            },
            { test: /\.js$/, exclude: /node_modules/,
                use: [
                    {loader: 'babel-loader'},
                    ...[!isProd && 'eslint-loader']
                ]
            },
        ],
    },
}