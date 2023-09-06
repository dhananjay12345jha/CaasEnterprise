import { join, resolve } from "path";
import slsw from "serverless-webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { Configuration } from "webpack";

export const baseWebpackConfig = (directory: string): Configuration => ({
  context: directory,
  mode: "production",
  entry: slsw.lib.entries,
  devtool: "inline-cheap-module-source-map",
  optimization: {
    minimize: true,
    minimizer: [
      () => {
        return () => {
          return {
            terserOptions: {
              format: {
                comments: false,
              },
            },
            extractComments: false,
          };
        };
      },
    ],
  },
  resolve: {
    extensions: [".mjs", ".json", ".ts", ".js"],
    symlinks: false,
    cacheWithContext: false,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: "tsconfig.app.json",
      }),
    ],
  },
  output: {
    libraryTarget: "commonjs",
    path: join(directory, ".webpack"),
    filename: "[name].js",
  },
  target: "node16",
  externals: [],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: "ts-loader",
        exclude: [
          [
            resolve(directory, "node_modules"),
            resolve(directory, ".serverless"),
            resolve(directory, ".webpack"),
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
});
