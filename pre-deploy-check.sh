#!/bin/bash

# PlaceIQ Deployment Checklist for Render
# Run this before deploying to ensure everything is ready

echo "🔍 PlaceIQ Deployment Pre-Check..."

# Check Node modules
if [ ! -d "server/node_modules" ]; then
  echo "❌ Server node_modules not found. Run: npm run install:all"
  exit 1
fi

if [ ! -d "client/node_modules" ]; then
  echo "❌ Client node_modules not found. Run: npm run install:all"
  exit 1
fi

# Check build
if [ ! -d "client/dist" ]; then
  echo "⚠️  Client build not found. This will be built during deployment."
else
  echo "✅ Client build exists"
fi

# Check environment files
if [ ! -f "server/.env" ]; then
  echo "❌ server/.env not found"
  exit 1
fi

echo "✅ All checks passed! Ready for deployment."
echo ""
echo "📋 Next steps:"
echo "1. Push code to GitHub: git push origin main"
echo "2. Connect repository to Render"
echo "3. Set environment variables in Render dashboard"
echo "4. Render will automatically deploy"
