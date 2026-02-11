#!/bin/bash
set -e

echo "=========================================="
echo "  Varto Platform - VPS Deployment Script"
echo "=========================================="

# ── 1. System Update ──
echo ""
echo "[1/8] Sistem güncelleniyor..."
apt update && apt upgrade -y

# ── 2. Node.js 20 ──
echo ""
echo "[2/8] Node.js 20 kuruluyor..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js: $(node -v)"

# ── 3. pnpm & PM2 ──
echo ""
echo "[3/8] pnpm ve PM2 kuruluyor..."
npm install -g pnpm pm2
echo "pnpm: $(pnpm -v)"

# ── 4. PostgreSQL ──
echo ""
echo "[4/8] PostgreSQL kuruluyor..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

# Create DB and user
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='varto'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER varto WITH PASSWORD 'VartoDb2026!';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='varto_medusa'" | grep -q 1 || \
    sudo -u postgres createdb -O varto varto_medusa
echo "PostgreSQL hazır"

# ── 5. Redis ──
echo ""
echo "[5/8] Redis kuruluyor..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
echo "Redis hazır"

# ── 6. Clone & Build ──
echo ""
echo "[6/8] Proje klonlanıyor ve build ediliyor..."
mkdir -p /var/www
cd /var/www

if [ -d "varto-platform" ]; then
    cd varto-platform
    git pull origin main
else
    git clone https://github.com/mahmut-a/varto-platform.git
    cd varto-platform
fi

cd apps/backend
pnpm install

# Create .env file
cat > .env << 'ENVEOF'
DATABASE_URL=postgres://varto:VartoDb2026!@localhost:5432/varto_medusa
REDIS_URL=redis://localhost:6379
STORE_CORS=*
ADMIN_CORS=*
AUTH_CORS=*
JWT_SECRET=varto_jwt_secret_2026_super_secure_key_here
COOKIE_SECRET=varto_cookie_secret_2026_super_secure_key_here
PORT=9000
NODE_ENV=production
ENVEOF

echo ".env oluşturuldu"

# Run migrations
echo "Migration çalıştırılıyor..."
npx medusa db:migrate

# Build
echo "Build ediliyor..."
pnpm run build

# ── 7. PM2 Start ──
echo ""
echo "[7/8] PM2 ile başlatılıyor..."
mkdir -p /var/log/varto
pm2 delete varto-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# ── 8. Firewall ──
echo ""
echo "[8/8] Firewall ayarlanıyor..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9000/tcp
echo "y" | ufw enable 2>/dev/null || true

echo ""
echo "=========================================="
echo "  ✅ Deployment tamamlandı!"
echo "  Backend: http://173.212.246.83:9000"
echo "  Admin:   http://173.212.246.83:9000/app"
echo "=========================================="
echo ""
echo "Admin kullanıcısı oluşturmak için:"
echo "  cd /var/www/varto-platform/apps/backend"
echo "  npx medusa user -e admin@varto.app -p Varto2026!"
echo ""
