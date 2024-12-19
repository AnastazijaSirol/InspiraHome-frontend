const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 8080, // Default port (change if necessary)
    allowedHosts: 'all', // Allow requests from any host (you can restrict this if needed)
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws', // Adjust WebSocket configuration for remote access
    },
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow CORS for development
    },
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/', // Dynamically set for production
  productionSourceMap: false, // Disable source maps in production for better performance
});
