const path = require('path');
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function run() {
  const isProd = process.env.NODE_ENV === 'production';
  const runMode = isProd ? 'prod' : 'dev';
  const needAnalyze = process.env.ANALYZE;
  const isServer = process.env.IS_SERVER === '1';
  const needOptimize = process.env.OPTIMIZE === '1';
  console.log('is production: %s, NODE_ENV: "%s", isServer: %s', isProd, process.env.NODE_ENV, isServer);

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

  const host = process.env.HOST || (isProd ? 'https://golangci.com' : 'https://dev.golangci.com');
  const runSuffixCommon = `${runMode}.${isServer ? "server" : "client"}.[name]`;
  const runSuffixForChunk = `${runSuffixCommon}${(isProd && !isServer) ? ".[chunkhash:6]" : ""}`;
  const runSuffixForCss = `${runSuffixCommon}${(isProd && !isServer) ? ".[md5:contenthash:hex:20]" : ""}`;
  const runSuffixForServerJs = runSuffixCommon;
  const runSuffixForFiles = runSuffixForChunk;

  var plugins = [
    new ForkTsCheckerWebpackPlugin(),
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
    plugins.push(new webpack.optimize.OccurrenceOrderPlugin(true));
  }

  if (isProd || needOptimize) {
    plugins.push(new UglifyJSPlugin({
      uglifyOptions: {
        ie8: true,
        safari10: true,
        ecma: 5,
        warnings: true,
      },
      sourceMap: true,
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
  }

  if (needAnalyze) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    plugins.push(new BundleAnalyzerPlugin());
  }

  const outPath = path.join(__dirname, process.env.DIST_DIR || ('dist/' + runMode));

  let loadRules = [];
  if (isProd) {
    loadRules.push({
      test: /\.tsx?$/,
      enforce: "pre",
      loader: 'tslint-loader',
      exclude: [/node_modules/],
    });
  }
  loadRules = loadRules.concat([
    {
      test: /\.tsx?$/,
      exclude: [/node_modules/],
      use: {
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          babelrc: false,
          presets: [
            [
              "@babel/preset-env",
              { targets: { browsers: "> 1%" } }
            ],
            "@babel/preset-typescript",
            "@babel/preset-react"
          ],
          plugins: [
            "@babel/plugin-transform-regenerator",
            ["import", {"libraryName": "antd"}],
            "react-hot-loader/babel"
          ]
        }
      }
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
     test: /\.(png|jpg|jpeg|gif)$/,
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
    {
      enforce: "pre",
      test: /\.(j|t)sx?$/,
      exclude: [
        /node_modules\/mutationobserver-shim/g,
        /node_modules\/react-component-octicons/g,
      ],
      loader: "source-map-loader"
    },

    {
     test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
     use: [{
       loader: 'file-loader',
       options: {
         name: `${runSuffixForFiles}.[ext]`,
         outputPath: 'fonts/',    // where the fonts will go
         publicPath: './'       // override the default path
       }
     }]
   },
  ]);

  // controls source map generation mode
  const devtool = isServer ? undefined : (isProd ? "source-map" : "eval-source-map");

  var commonConfig = {
    devServer: {
      open: true, // to open the local server in browser
      contentBase: path.join(__dirname, 'src', 'dev'),
      historyApiFallback: true,
    },
    plugins: plugins,
    devtool: devtool,

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
        rules: loadRules,
    },
  }

  var config;
  if (isServer) {
    config = Object.assign({}, commonConfig, {
      name: 'server-side rendering',
      entry: {
        app: ['@babel/polyfill', './src/server'],
      },
      target: 'node',
      output: {
        path: outPath,
        filename: `${runSuffixForServerJs}.js`,
        libraryTarget: 'commonjs2',
      },
    });
  } else {
    config = Object.assign({}, commonConfig, {
      entry: {
        app: ['@babel/polyfill', './src/client'],
      },
      name: 'browser',
      output: {
          filename: `${runSuffixForChunk}.js`,
          path: outPath,
          publicPath: '/',
      },
    });

    if (isProd || needOptimize) {
      config.optimization = {
        splitChunks: {
          cacheGroups: {
              default: false,
              vendors: false,
              // vendor chunk
              vendor: {
                  // sync + async chunks
                  chunks: 'all',
                  // import file path containing node_modules
                  test: /node_modules/,
              }
          }
        }
      };
    }
  }

  console.info(config);

  module.exports = config;
}

try {
  run();
} catch (e) {
  console.error("exception:", e);
}
