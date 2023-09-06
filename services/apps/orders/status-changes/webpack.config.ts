import { baseWebpackConfig } from "../../../tools/webpack.base";
import slsw from "serverless-webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import path from "path";

module.exports = {
  ...baseWebpackConfig(__dirname),
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal
    ? "eval-cheap-module-source-map"
    : "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".mjs", ".js", ".json"],
    symlinks: false,
    cacheWithContext: false,
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: "../../../tsconfig.base.json",
      }),
    ],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  optimization: {
    concatenateModules: false,
  },
  target: "node",
  externalsPresets: { node: true },
  externals: [{ newrelic: "commonjs newrelic" }],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: "ts-loader",
        exclude: [
          [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, ".serverless"),
            path.resolve(__dirname, ".webpack"),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  plugins: [],
};
