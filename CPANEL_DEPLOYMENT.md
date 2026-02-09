# Deploy Node.js Backend to cPanel

## Prerequisites:
- cPanel with Node.js support
- SSH access
- MongoDB Atlas account (free)

## Steps:

### 1. Setup Node.js App in cPanel
1. Login to cPanel
2. Go to "Setup Node.js App"
3. Click "Create Application"
4. Settings:
   - Node.js version: 18.x or higher
   - Application mode: Production
   - Application root: `minecrust_backend`
   - Application URL: `api.yourdomain.com` or `yourdomain.com/api`
   - Application startup file: `server.js`

### 2. Upload Backend Files
Option A - Via File Manager:
- Zip your `minecrust_backend` folder
- Upload to cPanel File Manager
- Extract in the application root directory

Option B - Via Git (Recommended):
```bash
# SSH into your cPanel
cd ~/minecrust_backend
git clone <your-repo-url> .
```

### 3. Install Dependencies
```bash
# SSH into cPanel
cd ~/minecrust_backend
npm install --production
```

### 4. Setup Environment Variables
In cPanel Node.js App settings, add:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### 5. Setup Cron Job
1. Go to cPanel "Cron Jobs"
2. Add new cron job:
   - Minute: 0
   - Hour: */6 (every 6 hours)
   - Command: `cd ~/minecrust_backend && /usr/bin/node -e "require('./jobs/dailyReturns').processInvestments()"`

### 6. Start Application
- In Node.js App section, click "Start App"
- Note the port number assigned

### 7. Setup Reverse Proxy (if needed)
If using subdomain (api.yourdomain.com):
- cPanel will auto-configure
- If not, add in .htaccess:
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:PORT/$1 [P,L]
```

### 8. Update Frontend .env
```
VITE_API_URL=https://api.yourdomain.com
# or
VITE_API_URL=https://yourdomain.com/api
```

## Advantages:
✓ No spin-down - always running
✓ Reliable cron jobs
✓ Better performance
✓ Same hosting as frontend
✓ Easier management

## Testing:
```bash
curl https://api.yourdomain.com/api/health
```
