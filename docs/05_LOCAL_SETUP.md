# Local Setup & Installation Guide

This document provides step-by-step instructions to run the Healthedia full-stack application locally on Windows using PowerShell.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Step 1: Clone & Navigate](#step-1-clone--navigate)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Setup Environment Variables](#step-3-setup-environment-variables)
5. [Step 4: Start the Servers](#step-4-start-the-servers)
6. [Expected URLs & Access](#-expected-urls--access)
7. [How to Verify Backend Connectivity](#-how-to-verify-backend-connectivity)
8. [Common Errors & Fixes](#-common-errors--fixes)
9. [🔍 Agent Notes](#-agent-notes)

---

## 🛠️ Prerequisites

To run Healthedia locally on Windows, you must install **Node.js** (v18+) or **Bun** (the modern high-performance JavaScript runtime).

### Windows Installation Commands (via PowerShell as Administrator):

#### Option A: Node.js (via Winget)
Open PowerShell as Administrator and run:
```powershell
winget install OpenJS.NodeJS
```

#### Option B: Bun (Native Windows)
To install Bun natively on Windows, run:
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify your installations:
```powershell
node -v
npm -v
# OR if using Bun
bun -v
```

---

## Step 1: Clone & Navigate

Open your PowerShell terminal, clone your repository, and navigate into the project root directory:
```powershell
cd path\to\your\workspace\healthedia
```

---

## Step 2: Install Dependencies

Install the packages listed in `package.json` to configure the Vite compiler and Express backend.

### Using npm:
```powershell
npm install
```

### Using Bun (Recommended for maximum speed):
```powershell
bun install
```

---

## Step 3: Setup Environment Variables

The application reads system-level secrets for API proxying and canonical URLs. Copy the template and fill in your keys:

```powershell
Copy-Item .env.example .env
```

Open the newly created `.env` file in your preferred editor (e.g., VS Code):
```powershell
code .env
```

### Fill in the parameters:
```env
# Enter your Gemini API secret if utilizing AI summaries (Optional)
GEMINI_API_KEY="AIzaSyYourActualKeyHere"

# Change to localhost for local testing
APP_URL="http://localhost:3000"
```

---

## Step 4: Start the Servers

Healthedia uses a unified developer server pattern. Since Vite is mounted directly inside the Express lifecycle, **you only need to launch a single command** to boot both the REST API and the frontend client.

### Option A: Using npm
```powershell
npm run dev
```

### Option B: Using Bun
```powershell
bun run dev
```

---

## 🌐 Expected URLs & Access

Once the startup log outputs `[Sitemap Server] Healthedia dynamic service running`, open your web browser and navigate to:

- **Local Web Application URL**: [http://localhost:3000](http://localhost:3000)
- **API Health Check Endpoint**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Primary Database Hydration Route**: [http://localhost:3000/api/db](http://localhost:3000/api/db)

---

## 📡 How to Verify Backend Connectivity

To ensure that the React frontend is successfully syncing with the local database:

1. Open **Developer Tools (F12)** in your browser and switch to the **Network** tab.
2. Navigate to [http://localhost:3000](http://localhost:3000).
3. Verify that a successful network request is made to `GET /api/db` (returning status `200 OK`).
4. Click **Log In** on the top navigation bar, and select a Quick Login demo account (e.g., *Evelyn Thorne*).
5. Go to the **SEO Manager** or **Support tickets** panel, modify a setting or write a ticket, and click save.
6. Verify that a `POST` request is sent to `/api/collections/.../sync`.
7. Open the `data/db.json` file in VS Code. You should see your newly saved record persisted in real time on disk!

---

## ❌ Common Errors & Fixes

### 1. Error: `Vite: not found` or `tsx: not found`
* **Cause**: Dependencies are missing or node_modules was cleared.
* **Fix**: Run `npm install` or `bun install` to pull down required compiler binaries.

### 2. Error: `EADDRINUSE: address already in use :::3000`
* **Cause**: Another service is running on port 3000 (e.g., a background Node script or Docker container).
* **Fix**: Find and kill the process occupying port 3000. In PowerShell:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
  ```

### 3. Error: `Unauthorized Access / Policy Restrictions` in PowerShell
* **Cause**: Windows Execution Policy blocks custom script execution.
* **Fix**: Set the execution policy to allow script run sessions:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## 🔍 Agent Notes

The single-command startup is one of Healthedia's greatest assets. In typical full-stack projects, developers are forced to run frontend compilers in one terminal and backend servers in another, causing port clashes and CORS (Cross-Origin Resource Sharing) headaches. Mounting the Vite dev compiler directly inside the Express server ensures they share the same origin, entirely eliminating the need for CORS headers.
