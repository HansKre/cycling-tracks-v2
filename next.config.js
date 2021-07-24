module.exports = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    // allow using back-end modules (which depend on fs) in front-end
    webpack: (config) => {
        config.resolve.fallback = { fs: false };

        return config;
    },
}