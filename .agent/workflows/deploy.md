---
description: Deploy backend to VPS
---
# How to deploy the backend to VPS

This workflow deploys the Medusa backend to the VPS server.

## Prerequisites
- VPS credentials configured (root@173.212.246.83)
- SSH access set up with sshpass

## Steps

// turbo-all

1. Push changes to GitHub:
```
git add -A && git commit -m "deploy: backend update" && git push origin main
```

2. If CI/CD is set up, the deploy will happen automatically via GitHub Actions.

3. For manual deploy, SSH into VPS and run:
```
ssh root@173.212.246.83
cd /var/www/varto-platform
git pull origin main
CI=true pnpm install
cd apps/backend
NODE_ENV=development npx medusa db:migrate
NODE_ENV=development npx medusa build
cp .env .medusa/server/.env
cp .env .medusa/server/.env.production
cd .medusa/server
npm install
mkdir -p /var/log/varto
pm2 delete varto-backend
pm2 start /var/www/varto-platform/apps/backend/ecosystem.config.js
pm2 save
```

## Notes
- The `ecosystem.config.js` at `/var/www/varto-platform/apps/backend/` sets `NODE_ENV=production` and `cwd` to `.medusa/server`.
- Build must be done with `NODE_ENV=development` (so ts-node is available for config loading).
- After `medusa build`, the `.medusa/server` directory is a standalone app — it needs its own `npm install` for node_modules.
- Production start uses `NODE_ENV=production` (via ecosystem config) so ts-node is NOT needed at runtime.
- `.env.production` is loaded by Medusa when `NODE_ENV=production`.

