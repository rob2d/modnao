/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    'three'
  ],
  modularizeImports: {
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}'
    }
  },
  webpack: (config) => {
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
    return config;
  }
};

module.exports = nextConfig;
