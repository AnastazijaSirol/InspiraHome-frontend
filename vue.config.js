const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // Allow external connections
    port: 8080, // Default port (you can change this if needed)
    allowedHosts: ['.onrender.com'], // Allow requests from Render's domains
  },
  publicPath: '/', // Ensure correct path resolution for assets
  productionSourceMap: false, // Disable source maps in production for better performance
});
