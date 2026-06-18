# 🚀 PlaceIQ - Quick Deployment Reference

## Deployment in 5 Minutes

### 1️⃣ Verify Everything is Ready
```bash
node verify-deployment.js
```
✅ All checks should pass

### 2️⃣ Push to GitHub
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### 3️⃣ Create Render Service
- Go to render.com
- Click "New Web Service"
- Connect GitHub repo (placeiq)
- Select main branch

### 4️⃣ Configure Service
```
Build Command:  npm run render-build
Start Command:  npm start
Region:         Oregon (or preferred)
```

### 5️⃣ Set These Environment Variables

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://nirma:nirma@placeiq.aijqqox.mongodb.net/placeiq?retryWrites=true&w=majority&appName=placeiq` |
| `JWT_ACCESS_SECRET` | `placeiq_access_secret_2024_super_secure_production` |
| `JWT_REFRESH_SECRET` | `placeiq_refresh_secret_2024_super_secure_production` |
| `CLIENT_URL` | `https://your-service-url.onrender.com` |
| `GEMINI_API_KEY` | `AIzaSyCts8e7puNfwnx0tXPDG5ID8Y0o8aHnksU` |

### 6️⃣ Click "Create Web Service"
- Render starts building
- Takes 3-5 minutes
- Check logs for errors

### 7️⃣ Test Your App
```
✅ Health Check:  https://your-url.onrender.com/api/health
✅ Web App:       https://your-url.onrender.com
✅ Login:         admin@placeiq.com / Admin@123
```

---

## ✅ What's Already Configured

- ✅ MongoDB connection string (database name included)
- ✅ React app builds and serves from server
- ✅ CORS properly configured
- ✅ JWT authentication ready
- ✅ All API routes working
- ✅ Environment variable system ready
- ✅ Build scripts optimized

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check build logs, ensure all files committed |
| MongoDB error | Verify connection string, check IP whitelist in Atlas |
| React app shows blank | Ensure npm run build completes in build logs |
| API returns 404 | Check CORS origin matches CLIENT_URL |

---

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Build Logs: Dashboard → Your Service → Logs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

