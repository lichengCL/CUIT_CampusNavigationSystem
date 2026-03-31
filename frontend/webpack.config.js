const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DotenvWebpack = require("dotenv-webpack");

module.exports = (_, argv = {}) => {
  const isProduction = argv.mode === "production";

  return {
    entry: path.resolve(__dirname, "src/index.jsx"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.[contenthash].js",
      clean: true,
      publicPath: isProduction ? "./" : "/"
    },
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                ["@babel/preset-react", { runtime: "automatic" }]
              ]
            }
          }
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
        favicon: path.resolve(__dirname, "public/favicon.svg")
      }),
      new DotenvWebpack({
        path: path.resolve(__dirname, ".env"),
        systemvars: true
      })
    ],
    devServer: {
      host: "127.0.0.1",
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: false
    }
  };
};
