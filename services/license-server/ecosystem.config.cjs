// pm2 configuration, as an alternative to the systemd unit.
//
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup     # survive a reboot
//   pm2 logs richkit-license
//
// One instance only: the throttle and the in-memory index of issued keys live
// in the process, and cluster mode would give each worker its own copy.
module.exports = {
  apps: [
    {
      name: 'richkit-license',
      script: 'server.mjs',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      // The service is idle between orders; a rising heap means a leak.
      max_memory_restart: '200M',
      env_file: '.env',
      time: true,
    },
  ],
}
