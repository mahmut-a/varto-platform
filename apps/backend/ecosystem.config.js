module.exports = {
    apps: [{
        name: 'varto-backend',
        script: 'node_modules/.bin/medusa',
        args: 'start',
        cwd: '/var/www/varto-platform/apps/backend/.medusa/server',
        env: {
            NODE_ENV: 'production',
            PORT: 9000
        },
        instances: 1,
        max_memory_restart: '512M',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: '/var/log/varto/error.log',
        out_file: '/var/log/varto/out.log',
        merge_logs: true,
    }]
}
