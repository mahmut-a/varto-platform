#!/bin/bash
set -e

echo "=========================================="
echo "  Varto Platform - VPS Deployment Script"
echo "=========================================="

# ── 1. System Update ──
echo ""
echo "[1/9] Sistem güncelleniyor..."
apt update && apt upgrade -y

# ── 2. Node.js 20 ──
echo ""
echo "[2/9] Node.js 20 kuruluyor..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js: $(node -v)"

# ── 3. pnpm & PM2 ──
echo ""
echo "[3/9] pnpm ve PM2 kuruluyor..."
npm install -g pnpm pm2
echo "pnpm: $(pnpm -v)"

# ── 4. PostgreSQL ──
echo ""
echo "[4/9] PostgreSQL kuruluyor..."
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
echo "[5/9] Redis kuruluyor..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
echo "Redis hazır"

# ── 6. Clone & Build ──
echo ""
echo "[6/9] Proje klonlanıyor ve build ediliyor..."
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
npx medusa build

# ── 7. PM2 Start ──
echo ""
echo "[7/9] PM2 ile başlatılıyor..."
mkdir -p /var/log/varto
pm2 delete varto-backend 2>/dev/null || true
pm2 start "npx medusa start" --name "varto-backend" --cwd /var/www/varto-platform/apps/backend
pm2 save
pm2 startup

# ── 8. Nginx ──
echo ""
echo "[8/9] Nginx kuruluyor ve ayarlanıyor..."
apt install -y nginx

cat > /etc/nginx/sites-available/varto-api << 'NGINX_EOF'
server {
    listen 80;
    server_name 173.212.246.83;

    client_max_body_size 50M;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    location / {
        proxy_pass http://127.0.0.1:9000;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/varto-api /etc/nginx/sites-enabled/varto-api
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
systemctl enable nginx
echo "Nginx hazır"

# ── 9. Firewall ──
echo ""
echo "[9/9] Firewall ayarlanıyor..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9000/tcp
echo "y" | ufw enable 2>/dev/null || true

echo ""
echo "=========================================="
echo "  ✅ Deployment tamamlandı!"
echo "  API:   http://173.212.246.83"
echo "  API:   http://173.212.246.83:9000"
echo "=========================================="
echo ""
echo "Admin kullanıcısı oluşturmak için:"
echo "  cd /var/www/varto-platform/apps/backend"
echo "  npx medusa user -e admin@varto.app -p VartoAdmin2026!"
echo ""
echo "Yeniden deploy etmek için:"
echo "  cd /var/www/varto-platform && git pull && cd apps/backend && pnpm install && npx medusa db:migrate && npx medusa build && pm2 restart varto-backend"
echo ""
