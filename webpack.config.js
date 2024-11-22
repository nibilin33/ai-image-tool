const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const px2rem = require("postcss-plugin-px2rem");

const px2remOpts = {
  rootValue: 75,
  exclude: /(node_module)/,
  mediaQuery: false,
  minPixelValue: 3,
};

function getPages() {
  const pages = path.resolve(__dirname, "src");
  const dirs = fs.readdirSync(pages);
  let pageConfig = {};
  let plugins = [];
  dirs.forEach((name) => {
    const stat = fs.lstatSync(path.join(pages, name));
    if (stat.isDirectory()) {
      const appEntry = path.join(pages, `${name}/app.js`);
      if (fs.existsSync(appEntry)) {
        pageConfig[name] = path.join(pages, `${name}/app.js`);
        plugins.push(
          new HtmlWebpackPlugin({
            template: path.join(pages, `${name}/index.html`),
            filename: `${name}/index.html`,
            chunks: [name],
            inject: "body",
          })
        );
      } else {
        const folder = path.join(pages, name);
        plugins.push(
          new CopyPlugin({
            patterns: [{ from: folder, to: name }],
          })
        );
      }
    }
  });

  return {
    entry: pageConfig,
    plugins,
  };
}
const pageConfig = getPages();
module.exports = {
  entry: pageConfig.entry,
  output: {
    filename: "[name]/[chunkhash].js",
    chunkFilename: "[name]/[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
    crossOriginLoading: "anonymous",
    publicPath: "/image-tool/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        },
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "/image-tool/",
            },
          },
         {
          loader: 'css-loader'
         },
           {
            loader: require.resolve("postcss-loader"),
            options: {

              postcssOptions: {
                plugins: [
                  px2rem(px2remOpts),
                  require('cssnano')({
                    preset: 'default',
                  }),
                  require("@tailwindcss/nesting")(require("postcss-nesting")),
                  require("tailwindcss"),
                  require("autoprefixer"),
                  require("postcss-minify")
                ],
              },
            },
          },
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
      publicPath: "/image-tool/",
    },
    compress: true,
    port: 9004,
    allowedHosts: "all",
    proxy: {},
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  entry: pageConfig.entry,
  plugins: [
    ...pageConfig.plugins,
    new webpack.ProvidePlugin({
      $: "zepto-webpack",
      jQuery: "zepto-webpack",
    }),
    new CopyPlugin({
      patterns: [{ from: "public", to: "public" }],
    }),
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].css",
    }),
  ],
};
