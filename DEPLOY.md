# PlaceIQ - Deployment Guide

## Deployment to Render

### Prerequisites
- MongoDB Atlas cluster (already configured)
- Render account
- Git repository with this code

### Step 1: Connect Your GitHub Repository
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select "PlaceIQ" repository

### Step 2: Configure the Service
- **Name:** placeiq-api
- **Region:** Oregon (or closest to you)
- **Branch:** main
- **Build Command:** `npm run render-build`
- **Start Command:** `npm start`

### Step 3: Set Environment Variables
Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://nirma:nirma@placeiq.aijqqox.mongodb.net/placeiq?retryWrites=true&w=majority&appName=placeiq
JWT_ACCESS_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-secret-key
CLIENT_URL=https://your-app.onrender.com
GEMINI_API_KEY=AIzaSyCts8e7puNfwnx0tXPDG5ID8Y0o8aHnksU
```

### Step 4: Deploy
- Click "Create Web Service"
- Render will automatically start the build
- Wait for the deployment to complete

### Step 5: Seed Data (Optional)
Once deployed, seed initial data:
```bash
npm run seed
```

Or manually via a POST request to trigger seeding.

## Troubleshooting

### MongoDB Authentication Error
✅ Connection string already includes database name and proper parameters

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version is 18.x or higher

### Port Issues
- Render uses port 10000, already configured in .env.production

## Health Check
Your API is running when you can access:
```
https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "PlaceIQ API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
