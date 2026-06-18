# 🚀 PlaceIQ - Complete Render Deployment Guide

## ✅ Pre-Deployment Checklist (Already Done)

- [x] MongoDB connection string updated with database name
- [x] render.yaml configuration file created
- [x] Procfile created as backup
- [x] Environment variables configured
- [x] Build scripts updated
- [x] Server configured to serve React app in production
- [x] CORS configured for production

## 📋 Step-by-Step Deployment Instructions

### Phase 1: Prepare Your Code

1. **Commit all changes to Git:**
   ```bash
   git add .
   git commit -m "Deploy: Final configuration for Render"
   git push origin main
   ```

2. **Verify your GitHub repository is up to date**

### Phase 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click "New +" in the dashboard

### Phase 3: Create Web Service

1. Select **"Web Service"**
2. Click **"Connect a repository"**
3. Search for your **placeiq** repository
4. Click **"Connect"**

### Phase 4: Configure Service Settings

**Basic Settings:**
- **Name:** `placeiq` (or any name you prefer)
- **Environment:** `Node`
- **Region:** `Oregon` (default) or closest to you
- **Branch:** `main`
- **Build Command:** `npm run render-build`
- **Start Command:** `npm start`

### Phase 5: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://nirma:nirma@placeiq.aijqqox.mongodb.net/placeiq?retryWrites=true&w=majority&appName=placeiq` |
| `JWT_ACCESS_SECRET` | `your-super-secret-access-key-change-this` |
| `JWT_REFRESH_SECRET` | `your-super-secret-refresh-key-change-this` |
| `CLIENT_URL` | `https://placeiq.onrender.com` |
| `GEMINI_API_KEY` | `AIzaSyCts8e7puNfwnx0tXPDG5ID8Y0o8aHnksU` |

> **⚠️ Important:** After Render generates your URL, update `CLIENT_URL` to match it exactly (e.g., `https://placeiq-xyz.onrender.com`)

### Phase 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building automatically
3. Monitor the build in the **"Logs"** tab
4. Wait until you see: `✅ Your service is live`

### Phase 7: Verify Deployment

After deployment completes:

1. **Check health endpoint:**
   ```
   https://your-service-url.onrender.com/api/health
   ```
   Should return: `{"success":true,"message":"PlaceIQ API is running",...}`

2. **Access your app:**
   ```
   https://your-service-url.onrender.com
   ```

3. **Test login with:**
   - Email: `admin@placeiq.com`
   - Password: `Admin@123`

## 🔧 Troubleshooting Common Errors

### Error: "Build failed"
- Check build logs in Render dashboard
- Ensure all files are committed to Git
- Run locally: `npm run render-build`

### Error: "MongoDB authentication failed"
- ✅ Already fixed with updated connection string
- Verify MongoDB credentials in MONGODB_URI are correct
- Check if IP is whitelisted in MongoDB Atlas

### Error: "Port already in use"
- Render handles port assignment automatically
- Do NOT hardcode port in production
- Server automatically uses `process.env.PORT`

### Error: "React app shows 'Cannot GET /'"
- Ensure `client/dist` is created during build
- Check that build command runs: `npm run render-build`
- Verify static file serving is enabled in server.js ✅

### Error: "API calls return 404"
- Check that API routes match `/api/*` pattern
- Verify CORS is enabled for production origin
- Test with: `curl https://your-url.onrender.com/api/health`

## 🌐 Post-Deployment Configuration

### Update Frontend API URL

If needed, update `CLIENT_URL` in Render environment variables to match your actual Render domain.

### SSL Certificate

Render automatically provides HTTPS with Let's Encrypt. No action needed.

### Custom Domain (Optional)

In Render Dashboard:
1. Go to Settings → Custom Domains
2. Add your domain (e.g., `placeiq.com`)
3. Follow DNS configuration instructions

## 📊 Monitoring

### View Logs
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. Monitor real-time server activity

### Check Resource Usage
- Click **"Metrics"** tab
- Monitor CPU, Memory, and Bandwidth

## 🔐 Security Checklist

- [x] MongoDB connection uses SSL/TLS (MongoDB Atlas default)
- [x] Environment variables not committed to Git
- [x] JWT secrets are strong and unique
- [x] CORS configured to production origin only
- [x] Helmet security middleware enabled
- [x] Rate limiting on auth routes enabled

## 💾 Backup & Recovery

If deployment fails:
1. Check **Build Logs** for specific errors
2. Fix issues locally
3. Commit to Git
4. Render will auto-redeploy when it detects new commits (if using GitHub integration)

## ✨ What's Included

Your deployment includes:
- ✅ Express.js backend with all API routes
- ✅ React frontend built with Vite
- ✅ MongoDB Atlas database connection
- ✅ JWT authentication
- ✅ CORS security headers
- ✅ Rate limiting
- ✅ Error handling
- ✅ Health check endpoint

## 🆘 Need Help?

1. **Check Render logs:** Dashboard → Logs tab
2. **Test locally first:** `npm run dev:server` and `npm run dev:client`
3. **Verify environment variables** match exactly (spaces matter!)
4. **Check MongoDB Atlas** that your IP is whitelisted

---

**Congratulations! Your PlaceIQ app is ready to deploy! 🎉**
