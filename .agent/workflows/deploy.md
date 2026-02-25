---
description: Deploy backend to VPS
---
# How to deploy the backend to VPS

This workflow deploys the Medusa backend to the VPS server.

## Prerequisites
- VPS credentials configured (root@173.212.246.83)
- SSH access set up

## ⚠️ Critical Notes
- **Package Manager**: Project uses `pnpm` (NOT npm). Always use `pnpm install` at root level.
- **Build Server Dir**: `.medusa/server/` is a standalone app after build. Its `package.json` also has `"packageManager": "pnpm"` but `npm install` works there (just slow). Best to use existing node_modules.
- **ts-node**: Required for `medusa build` and `medusa db:migrate` commands. Must be installed as devDependency.
- **NODE_ENV**: Build and migrate MUST run with `NODE_ENV=development` (ts-node needed for config loading). Production runs via ecosystem.config.js which sets `NODE_ENV=production`.
- **PowerShell SSH Issues**: Complex commands with `&&`, nested quotes, and special chars fail in PowerShell SSH. For complex debugging, SCP a .js file to VPS and run with `node`.
- **.env Files**: Must copy `.env` to BOTH `.medusa/server/.env` AND `.medusa/server/.env.production` (Medusa loads `.env.production` when `NODE_ENV=production`).
- **CORS**: Mobile apps connect via `https://api.vartoyazilim.com`. STORE_CORS in VPS .env must include mobile origins or use wildcard.
- **Publishable API Key**: Store routes require `x-publishable-api-key` header. Current key: `pk_3e6b05a597fd3200651f1fc61bf7551c1b7070556a6d238be6ae8fef5fdf5c1d`

## Steps

// turbo-all

1. Commit and push changes to GitHub:
```
git add -A
git commit -m "deploy: backend update"
git push origin main
```

2. SSH into VPS and pull latest code:
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "cd /var/www/varto-platform && git pull origin main"
```

3. Install dependencies (use --no-frozen-lockfile if lockfile changed):
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "cd /var/www/varto-platform && pnpm install --no-frozen-lockfile 2>&1 | tail -10"
```

4. Run database migrations:
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "cd /var/www/varto-platform/apps/backend && NODE_ENV=development npx medusa db:migrate 2>&1 | tail -15"
```

5. Build the backend:
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "cd /var/www/varto-platform/apps/backend && NODE_ENV=development npx medusa build 2>&1 | tail -10"
```

6. Copy .env files to build output:
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "cd /var/www/varto-platform/apps/backend && cp .env .medusa/server/.env && cp .env .medusa/server/.env.production"
```

7. Restart PM2 process:
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "pm2 delete varto-backend 2>/dev/null; mkdir -p /var/log/varto; pm2 start /var/www/varto-platform/apps/backend/ecosystem.config.js; pm2 save"
```

8. Verify health (wait a few seconds for startup):
```
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "sleep 5; curl -s --max-time 10 http://localhost:9000/health"
```
Expected output: `OK`

## Troubleshooting

### Backend won't start (errored state)
1. Check error logs: `ssh root@173.212.246.83 "tail -30 /var/log/varto/error.log"`
2. Check out logs: `ssh root@173.212.246.83 "tail -30 /var/log/varto/out.log"`
3. Common cause: `Cannot find module 'ts-node'` → Run step 3 again with `--no-frozen-lockfile`

### "unknown_error" on API endpoints
- Usually means the request is missing `x-publishable-api-key` header (for store routes)
- Or CORS issue if from browser/app
- Test with: `node` script using `http.request()` (avoid curl in PowerShell SSH)

### npm install hangs in .medusa/server
- The `.medusa/server/` dir already has node_modules from previous builds (718MB+)
- Usually no need to reinstall — just rebuild and restart
- If needed, use `cd .medusa/server && npm install --legacy-peer-deps`

### PM2 process name
- Process name is `varto-backend` (defined in ecosystem.config.js)
- Check status: `pm2 pid varto-backend` (returns PID if running)
- Logs: `/var/log/varto/out.log` and `/var/log/varto/error.log`
