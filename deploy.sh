#!/bin/bash
# Varto Backend Deploy Script
# Kullanım: ssh root@VPS 'bash /var/www/varto-platform/deploy.sh'

set -e
cd /var/www/varto-platform

echo "=== [1/5] Git Pull ==="
git pull origin main

echo "=== [2/5] pnpm install ==="
CI=true pnpm install

echo "=== [3/5] DB Migrate ==="
cd apps/backend
NODE_ENV=development npx medusa db:migrate

echo "=== [4/5] Build ==="
NODE_ENV=development npx medusa build

echo "=== [5/5] ENV + PM2 Restart ==="
cp .env .medusa/server/.env
cp .env .medusa/server/.env.production
mkdir -p /var/log/varto
pm2 delete varto-backend 2>/dev/null || true
pm2 start /var/www/varto-platform/apps/backend/ecosystem.config.js
pm2 save

echo ""
echo "=== Deploy Tamamlandi ==="
pm2 jlist 2>&1 | python3 -c "import sys,json; [print(f'  {p[\"name\"]} -> {p[\"pm2_env\"][\"status\"]}') for p in json.load(sys.stdin)]"
