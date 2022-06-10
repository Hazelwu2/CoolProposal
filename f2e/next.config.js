/** @type {import('next').NextConfig} */

module.exports = {
  future: {
    webpack5: true,
  },
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;
    return config;
  },
}
