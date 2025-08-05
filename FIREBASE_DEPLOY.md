# 🔥 Firebase Hosting Deployment Guide

## 📋 Firebase Console Settings

### Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`
- **Node Version**: `18`

### Environment Variables (Add in Firebase Console)
```
REACT_APP_API_URL=https://law-gpt-backend20-production.up.railway.app
REACT_APP_ENV=production
REACT_APP_NAME=Law GPT Professional
REACT_APP_VERSION=2.0.0
```

## 🚀 Deployment Commands

### First Time Setup
```bash
# 1. Create Firebase project at https://console.firebase.google.com/
# 2. Project name: law-gpt-professional
# 3. Enable Hosting

# 4. Initialize in your project
firebase login
firebase init hosting
# Select: law-gpt-professional
# Public directory: build
# Single-page app: Yes
# Overwrite index.html: No

# 5. Build and deploy
npm run build
firebase deploy
```

### Subsequent Deployments
```bash
npm run build
firebase deploy
```

## 🌐 Expected URLs
- **Live Site**: https://law-gpt-professional.web.app
- **Custom Domain**: https://law-gpt-professional.firebaseapp.com

## 📊 Firebase Console Configuration

### Hosting Settings
1. Go to Firebase Console → Hosting
2. Click "Add custom domain" (optional)
3. Configure SSL (automatic)
4. Set up redirects if needed

### Performance
- ✅ Global CDN included
- ✅ SSL certificate automatic
- ✅ Compression enabled
- ✅ Caching optimized

## 🔧 Troubleshooting

### If build fails:
```bash
npm install
npm run build
```

### If deployment fails:
```bash
firebase logout
firebase login
firebase deploy --debug
```

### If API connection fails:
- Check CORS settings in Railway backend
- Verify environment variables
- Test API endpoint directly

## 📱 Testing After Deployment

Test these queries on your live site:
1. "What is Section 302 IPC?"
2. "Explain Article 21 Constitution"
3. "Consumer rights warranty"
4. "Inheritance without will"

Expected: 90%+ accuracy responses with professional formatting.