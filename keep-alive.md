# Keep Render Server Alive

## Free Solutions:

### 1. UptimeRobot (Recommended)
- Sign up at https://uptimerobot.com (Free)
- Add monitor: `https://minecrust-backend.onrender.com/api/health`
- Set interval: 5 minutes
- This pings your server every 5 minutes to keep it awake

### 2. Cron-Job.org
- Sign up at https://cron-job.org (Free)
- Create job: `https://minecrust-backend.onrender.com/api/health`
- Schedule: Every 5 minutes

### 3. Better Uptime
- Sign up at https://betteruptime.com (Free)
- Monitor: `https://minecrust-backend.onrender.com/api/health`
- Interval: 3 minutes

## Paid Solution:
Upgrade Render to paid plan ($7/month) - server never spins down
