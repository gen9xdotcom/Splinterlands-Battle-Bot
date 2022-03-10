module.exports = {
  apps: [{
    name: 'bot',
    script: './index.js',
    watch: '.',
    env: {
      NODE_ENV: 'production',
    },
  }, ],
};