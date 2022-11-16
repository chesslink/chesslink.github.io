/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    version,
  },
};

module.exports = nextConfig;
