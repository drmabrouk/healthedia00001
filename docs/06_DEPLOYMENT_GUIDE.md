# Full-Stack Deployment Guide

This document evaluates hosting environments and provides detailed step-by-step deployment guides for the Healthedia full-stack platform.

---

## 📋 Table of Contents
1. [Hosting Platform Comparison Matrix](#-hosting-platform-comparison-matrix)
2. [Option 1: Vercel Deployment (Easiest - Serverless API)](#option-1-vercel-deployment-easiest---serverless-api)
3. [Option 2: Railway Deployment (Best for Active Containers)](#option-2-railway-deployment-best-for-active-containers)
4. [Option 3: VPS Ubuntu with Nginx + PM2 (Enterprise Self-Hosted)](#option-3-vps-ubuntu-with-nginx--pm2-enterprise-self-hosted)
5. [🔒 SSL/HTTPS Configuration](#-sslhttps-configuration)
6. [Scale Recommendation](#-scale-recommendation)
7. [🔍 Agent Notes](#-agent-notes)

---

## 📊 Hosting Platform Comparison Matrix

| Platform Name | Cost Estimate | Bun Support | Disk Persistence | Difficulty Level | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vercel** | Free (Hobby) | 🔄 Partial (via Node wrapper) | ⚠️ None (Ephemeral) | **Easy** | Fast client reviews and serverless APIs |
| **Railway** | $5 - $8 / month | ✅ Full | ✅ Full (with Volume mount) | **Medium** | Developer prototypes and active backend apps |
| **VPS (Ubuntu)** | $4 - $12 / month | ✅ Full | ✅ Full (Local Disk) | **Hard** | Production platforms and medical databases |

---

## Option 1: Vercel Deployment (Easiest - Serverless API)

Vercel is ideal for lightning-fast frontend delivery. However, because Vercel uses **Serverless Functions**, disk-level writes to `data/db.json` are ephemeral (wiped out on function cold-starts). Under Vercel, you should pair the application with an external cloud database (such as Firebase Firestore).

### Step-by-Step Walkthrough:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
2. **Configure Rewrites (`vercel.json`)**:
   Create a `vercel.json` file in the root folder to route backend API traffic to serverless handlers:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" }
     ]
   }
   ```
3. **Trigger Deployment**:
   Run the deployment command:
   ```bash
   vercel
   ```
4. **Configure Environment Variables**:
   In the Vercel Dashboard, navigate to **Settings > Environment Variables** and add:
   - `GEMINI_API_KEY`: `your_key_here`
   - `APP_URL`: `https://your-app-subdomain.vercel.app`
5. **Promote to Production**:
   ```bash
   vercel --prod
   ```

---

## Option 2: Railway Deployment (Best for Active Containers)

Railway is the premier option for full-stack Node/Bun servers because it supports **continuous long-running containers** and **Volume Mounts** to persist files on disk.

### Step-by-Step Walkthrough:

1. **Create a Mapped Volume**:
   In your Railway dashboard, add a **Shared Volume** and mount it to `/app/data`. This ensures `data/db.json` persists permanently across builds and container redeployments.
2. **Link GitHub Repository**:
   Connect your GitHub repository to Railway. Railway will automatically detect `package.json` and build the application.
3. **Configure Custom Build Command**:
   Specify your start command in Railway's settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. **Set Environment Variables**:
   Add these in Railway's **Variables** tab:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: `your_key_here`
   - `APP_URL`: `https://your-custom-domain.up.railway.app`

---

## Option 3: VPS Ubuntu with Nginx + PM2 (Enterprise Self-Hosted)

For clinical environments requiring physical hardware ownership, a dedicated Virtual Private Server (VPS) with Ubuntu 22.04/24.04 provides unmatched speed and compliance.

### Step-by-Step Walkthrough:

### 1. System Setup & Dependencies
Connect to your VPS via SSH and install Node, Git, PM2, and Nginx:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2
```

### 2. Clone and Build the Application
```bash
cd /var/www
sudo git clone https://github.com/yourusername/healthedia.git
cd healthedia
sudo npm install
sudo npm run build
```

### 3. Create Environment File
Create a `.env` file in the root directory:
```bash
sudo nano .env
```
Add your production values:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY="your_api_key"
APP_URL="https://healthedia.org"
```

### 4. Start the Server with PM2
Use PM2 to run the Express process in the background and auto-restart it if it crashes:
```bash
pm2 start dist/server.cjs --name "healthedia"
pm2 save
pm2 startup
```

### 5. Configure Nginx Reverse Proxy
Edit the default Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/default
```
Replace the content with this reverse proxy block:
```nginx
server {
    listen 80;
    server_name healthedia.org www.healthedia.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL/HTTPS Configuration

To secure patient registrations and researcher profiles, you **must** force SSL/HTTPS.

### Setting up Let's Encrypt (Nginx on Ubuntu):
Run the Certbot command line tool to obtain a free SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d healthedia.org -d www.healthedia.org
```
Follow the interactive prompts. Certbot will automatically rewrite the Nginx configuration, issue the certificates, and configure auto-renewal!

---

## 📈 Scale Recommendation

- **Academics & Testing**: **Railway** or **Vercel** with mock datasets is perfect.
- **Enterprise & Clinical Launch**: Deploy on **Ubuntu VPS (DigitalOcean or Linode)**, and migrate the storage layer from the local JSON file to a fully-managed **Cloud SQL PostgreSQL** database with scheduled off-site backups.

---

## 🔍 Agent Notes

When deploying Healthedia, paying attention to **state persistence** is vital. If deploying to serverless platforms like Vercel or ephemeral containers like Heroku without volume attachments, the `data/db.json` database will reset on every server recycle. Therefore, securing volume mounting on Railway or hosting on a dedicated VPS is the only way to retain data safely without immediately rebuilding the API routing layers!
