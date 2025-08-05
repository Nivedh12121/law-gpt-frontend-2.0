@echo off
echo 🔥 Firebase Hosting Deployment for Law GPT 2.0
echo ================================================

echo 📦 Installing dependencies...
call npm install

echo 🏗️ Building production version...
call npm run build

echo 🔥 Deploying to Firebase Hosting...
call firebase deploy --only hosting

echo ✅ Deployment complete!
echo 🌐 Your Law GPT is now live globally!
pause