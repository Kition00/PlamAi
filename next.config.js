/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname)
    return config
  },
}
module.exports = nextConfig
