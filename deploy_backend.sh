#!/bin/bash
set -e

echo "=== STEP 1: Pull latest code ==="
cd /var/www/varto-platform
git pull origin main

echo "=== STEP 2: Install dependencies ==="
CI=true pnpm install

echo "=== STEP 3: Run migrations ==="
cd apps/backend
NODE_ENV=development npx medusa db:migrate

echo "=== STEP 4: Build ==="
NODE_ENV=development npx medusa build

echo "=== STEP 5: Copy env files ==="
cp .env .medusa/server/.env
cp .env .medusa/server/.env.production

echo "=== STEP 6: Install server deps ==="
cd .medusa/server
npm install

echo "=== STEP 7: Restart PM2 ==="
pm2 delete varto-backend 2>/dev/null || true
pm2 start /var/www/varto-platform/apps/backend/ecosystem.config.js
pm2 save

echo "=== STEP 8: Wait and health check ==="
sleep 15
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:9000/health)
echo "Health HTTP code: $HTTP_CODE"
curl -s http://localhost:9000/health
echo

echo "=== DEPLOY COMPLETE ==="
