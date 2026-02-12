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
cd apps/backend
npx medusa build
cp .env .medusa/server/.env
cd .medusa/server
pnpm install --prod
pm2 delete varto-backend
pm2 start 'npx medusa start' --name 'varto-backend' --cwd /var/www/varto-platform/apps/backend/.medusa/server
pm2 save
```
