/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    'three',
    '@thi.ng/k-means',
    '@uidotdev/usehooks',
    'nanoid'
  ],
  modularizeImports: {
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}'
    }
  },
  webpack: (config, { isServer, webpack }) => {
    config.module.rules.push({
      test: /\.worker\.ts$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash:5].[name].js'
      },
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: __dirname + '/worker.tsconfig.json'
          }
        }
      ]
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify')
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser'
        }),
        new webpack.NormalModuleReplacementPlugin(/node:crypto/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
    }

    config.resolve.fallback = { fs: false };
    return config;
  }
};

module.exports = nextConfig;
