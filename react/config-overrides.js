const { override, fixBabelImports, addLessLoader, addWebpackPlugin, disableEsLint, addBundleVisualizer, } = require('customize-cra');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');

const path = require('path');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

module.exports = override(
    // 支持IE11，新增polyfill
    (config) => {
        config.entry.unshift('@babel/polyfill');
        config.devtool = mode === 'prod' ? false : 'cheap-module-source-map';
        config.optimization.splitChunks = {
            chunks: 'all',
            name: false,
            minSize: 40000,
            minChunks: 1,
            cacheGroups: {
                vendor: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    minChunks: 1,
                    maxInitialRequests: 3,
                    maxAsyncRequests: 5,
                    minSize: 0,
                    priority: 100
                },
                common: {
                    chunks: 'all',
                    test: /[\\/]src[\\/].*\.js/,
                    name: 'common',
                    minChunks: 2,
                    maxInitialRequests: 3,
                    maxAsyncRequests: 5,
                    minSize: 0,
                    priority: 90
                }
            }
        };
        config.optimization.minimizer[1] = new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
                parser: safePostCssParser,
                map: false
            }
        });

        let loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
        loaders.unshift({
            test: /\.(js)$/,
            include: path.resolve(__dirname, 'src'),
            loader: 'happypack/loader?id=happyBabel'
        });
        return config;
    },
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true
    }),
    addLessLoader({
        javascriptEnabled: true,
        // modifyVars: { '@primary-color': 'yellow' }
    }),
    addWebpackPlugin(
        new FilterWarningsPlugin({
            exclude: /mini-css-extract-plugin[^]*Conflicting order between:/
        })
    ),
    addWebpackPlugin(
        new HappyPack({
            id: 'happyBabel',
            loaders: [{
                path: 'babel-loader',
                cache: true,
                query: {
                    presets: [require.resolve('babel-preset-react-app')],
                    plugins: [
                        [
                            require.resolve('babel-plugin-named-asset-import'),
                            {
                                loaderMap: {
                                    svg: {
                                        ReactComponent: '@svgr/webpack?-svgo,+ref![path]',
                                    },
                                },
                            },
                        ],
                        [
                            'import',
                            { libraryName: 'antd', libraryDirectory: 'es', style: true },
                            'fix-antd-imports'
                        ],
                        ['dynamic-import-node']
                    ]
                },
            }],
            //共享进程池
            threadPool: happyThreadPool,
            //允许 HappyPack 输出日志
            verbose: true
        })
    ),
    disableEsLint(),
    // addBundleVisualizer()
);