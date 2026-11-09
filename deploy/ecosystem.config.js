// PM2 process file: pm2 start deploy/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "khatoon-web",
      cwd: "/var/www/khatoon-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      max_memory_restart: "700M",
    },
  ],
};
