nbr_workers = process.env.CLUSTER_WORKERS || 2;

module.exports = {
  apps: [{
    name: 'ecotrack-api-gateway',
    script: 'server.js',
    instances: nbr_workers,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    merge_logs: true,
    time: true
  }]
};