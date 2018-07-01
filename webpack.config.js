const path = require('path');
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

function isExternal(module) {
  var context = module.context;

  if (typeof context !== 'string') {
    return false;
  }

  return context.indexOf('node_modules') !== -1;
}

function run() {
  const isProd = process.env.NODE_ENV === 'production';
  const runMode = isProd ? 'prod' : 'dev';
  const needAnalyze = process.env.ANALYZE;
  const isServer = process.env.IS_SERVER === '1';
  const needOptimize = process.env.OPTIMIZE === '1';
  console.log('is production: %s, NODE_ENV: "%s", isServer: %s', isProd, process.env.NODE_ENV, isServer);

  const tsxLoaders = ['babel-loader', 'awesome-typescript-loader'];

  const lessLoaderImpl = `less-loader?{"sourceMap":true}`;
  const cssLoaders = ['css-loader', 'sass-loader', lessLoaderImpl];

  const extractCss = (isProd || isServer);
  const cssLoader = extractCss ? ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: cssLoaders,
  }) : ['style-loader', 'css-loader'];

  const sassCommonLoaders = ['css-loader', 'sass-loader'];
  const sassLoader = extractCss ? ExtractTextPlugin.extract(sassCommonLoaders) : ['style-loader'].concat(sassCommonLoaders);

  const lessLoader = (isProd || isServer) ? ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: cssLoaders,
  }) : ['style-loader', 'css-loader', lessLoaderImpl];

  var api_host = process.env.API_HOST || (isProd ? `https://api.golangci.com` : 'https://api.dev.golangci.com');

  var host = process.env.HOST || (isProd ? 'https://golangci.com' : 'https://dev.golangci.com');
  var runSuffixCommon = `${runMode}.${isServer ? "server" : "client"}.[name]`;
  var runSuffixForChunk = `${runSuffixCommon}${(isProd && !isServer) ? ".[chunkhash:6]" : ""}`;
  var runSuffixForCss = `${runSuffixCommon}${(isProd && !isServer) ? ".[contenthash:6]" : ""}`;
  var runSuffix = `${runSuffixCommon}${(isProd && !isServer) ? ".[hash:6]" : ""}`;

  var plugins = [
    new webpack.LoaderOptionsPlugin({
      minimize: isProd,
      options: {
        tslint: {
          emitErrors: true,
          failOnHint: true,
        },
      },
    }),
    new webpack.DefinePlugin({
      __SERVER__: isServer,
      __CLIENT__: !isServer,
      __DEV__: !isProd,
      API_HOST: `"${api_host}"`,
      HOST: `"${host}"`,
      "process.env": {
         NODE_ENV: JSON.stringify(process.env.NODE_ENV),
       }
    }),
    new webpack.ContextReplacementPlugin(
      /moment[\/\\]locale$/,
      /ru/
    ),
  ];

  if ((isProd || needAnalyze) && !isServer) {
    plugins = plugins.concat([
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: isExternal,
      }),
    ]);
  }

  if (isProd || needOptimize) {
    plugins.push(new UglifyJSPlugin({
      uglifyOptions: {
        ie8: true,
        safari10: true,
        ecma: 5,
        warnings: true,
      }
    }));
  }

  if (isServer || isProd) {
    plugins.push(
      new ExtractTextPlugin({
        filename: `${runSuffixForCss}.css`,
        allChunks: true,
      })
    );
  }

  if (!isServer && isProd) {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    plugins.push(
      new HtmlWebpackPlugin({
        template: './src/webpack.partial.ejs',
        filename: './src/webpack.partial.html',
        inject: false,
        cache: true,
      })
    );

    const RollbarSourceMapPlugin = require('rollbar-sourcemap-webpack-plugin')
    const sourceVersion = process.env.SOURCE_VERSION || "dev";
    console.log("source version is '%s'", sourceVersion);
    plugins.push(
      new RollbarSourceMapPlugin({
        accessToken: '8d9dee66de9a4cc2acbec93d4ee98fa8',
        version: sourceVersion,
        publicPath: "https://golangci.com/",
      })
    );
  }

  if (needAnalyze) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    plugins.push(new BundleAnalyzerPlugin());
  }

  const outPath = path.join(__dirname, process.env.DIST_DIR || ('dist/' + runMode));

  var commonConfig = {
    devServer: {
      open: true, // to open the local server in browser
      contentBase: path.join(__dirname, 'src', 'dev'),
      historyApiFallback: true,
    },
    plugins: plugins,

    // Enable sourcemaps for debugging webpack's output.
    //devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [
          ".ts", ".tsx",
          ".scss", ".less", ".css",
          ".js", ".jsx", ".json",
          ".svg",
        ],

        modules: [
          path.resolve('./src'),
          path.resolve('./node_modules'),
        ],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
              test: /\.tsx?$/,
              enforce: "pre",
              loader: 'tslint-loader',
              exclude: [/node_modules/],
            },
            {
              test: /\.tsx?$/,
              loaders: tsxLoaders,
              exclude: [/node_modules/],
            },

            {
              test: /\.css$/,
              loader: cssLoader,
            },

            {
              test: /\.scss$/,
              loader: sassLoader,
            },

            {
              test: /\.less$/,
              loader: lessLoader,
            },

            {
             test: /\.(png|jpg|gif)$/,
             use: [
               {
                 loader: "file-loader",
                  options: {
                    outputPath: "images/",
                    publicPath: isProd ? "/js/dist/images/" : undefined,
                  },
               }
             ]
           },

            {
              test: /\.svg$/,
              use: [
                {
                  loader: "babel-loader"
                },
                {
                  loader: "react-svg-loader",
                  options: {
                    es5: true,
                    svgo: {
                      plugins: [
                        {removeAttrs: {attrs: 'xmlns.*'},},
                        {removeTitle: false},
                        {cleanupIDs: false},
                      ]
                    }
                  }
                }
              ],
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            //{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

            {
             test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
             use: [{
               loader: 'file-loader',
               options: {
                 name: `${runSuffix}.[ext]`,
                 outputPath: 'fonts/',    // where the fonts will go
                 publicPath: './'       // override the default path
               }
             }]
           },
        ]
    },
  }

  var config;
  if (isServer) {
    config = Object.assign({}, commonConfig, {
      name: 'server-side rendering',
      entry: {
        app: ['babel-polyfill', './src/server'],
      },
      target: 'node',
      output: {
        path: outPath,
        filename: `${runSuffix}.js`,
        libraryTarget: 'commonjs2',
      },
    });
  } else {
    config = Object.assign({}, commonConfig, {
      entry: {
        app: ['babel-polyfill', './src/client'],
      },
      name: 'browser',
      output: {
          filename: `${runSuffixForChunk}.js`,
          path: outPath,
          publicPath: '/',
      },
    });
  }

  console.info(config);

  module.exports = config;
}

try {
  run();
} catch (e) {
  console.error("exception:", e);
}
