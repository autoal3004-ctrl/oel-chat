# 🚀 READY TO UPLOAD! - Your Personalized Guide

## ✅ **STEP 1: Create Upload Folder (2 minutes)**

1. **On your Desktop**, create a new folder: `OEL-CHAT-UPLOAD`

2. **Copy these files/folders** from `c:\Users\snapl\OneDrive\Desktop\code\OEL CHAT\` into your new `OEL-CHAT-UPLOAD` folder:

   ```
   ✅ Copy these folders:
   📁 config/
   📁 middleware/ 
   📁 models/
   📁 routes/
   📁 uploads/ (copy the empty folders inside: posts, profiles, messages)
   
   ✅ Copy these files:
   📄 package.json
   📄 server.js
   📄 README.md
   ```

3. **Create your .env file**:
   - Copy `.env.hostinger` to your `OEL-CHAT-UPLOAD` folder
   - Rename it to `.env` (remove the .hostinger part)

## ✅ **STEP 2: Verify Your Database Info**

Your `.env` file should contain:
```
DB_HOST=mysql.hostinger.com
DB_NAME=u654741053_OELCHAT
DB_USER=u654741053_OELCHAT
DB_PASSWORD=Ledi1234?
```

**⚠️ IMPORTANT**: If your Hostinger database host is different from `mysql.hostinger.com`, you need to:
1. Log into Hostinger Control Panel
2. Go to Databases → MySQL
3. Check the exact hostname for your database

## ✅ **STEP 3: Upload to Hostinger (5 minutes)**

1. **Login** to your Hostinger account
2. **Go to**: Hosting → Manage → File Manager
3. **Navigate** to `public_html` folder
4. **Create** a new folder called `api`
5. **Enter** the `api` folder
6. **Upload** all files from your `OEL-CHAT-UPLOAD` folder
   - Drag and drop OR use the Upload button
   - Upload everything inside

## ✅ **STEP 4: Setup Node.js App (3 minutes)**

1. **In Hostinger Control Panel** → go to **Node.js**
2. **Click**: "Create Application"
3. **Fill in**:
   - Application root: `/public_html/api`
   - Application startup file: `server.js`
   - Node.js version: Choose latest (18.x or 20.x)
4. **Add Environment Variables** (click "Add Variable" for each):
   ```
   NODE_ENV = production
   DB_HOST = mysql.hostinger.com
   DB_NAME = u654741053_OELCHAT
   DB_USER = u654741053_OELCHAT
   DB_PASSWORD = Ledi1234?
   JWT_SECRET = OEL_CHAT_2025_SUPER_SECURE_JWT_SECRET_KEY_Ledi_Production_8b9a2c1d
   PORT = 3000
   ```

## ✅ **STEP 5: Install & Start (2 minutes)**

1. **In Node.js panel** → click "Run npm install"
2. **Wait** for installation to complete
3. **Click**: "Start Application"
4. **Check**: Status should show "Running" ✅

## ✅ **STEP 6: Test Your API (1 minute)**

1. **Replace `yourdomain.com`** with your actual domain
2. **Visit**: `https://yourdomain.com/api/health`
3. **Should see**:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-08-07...",
     "uptime": 123,
     "environment": "production"
   }
   ```

## 🎉 **SUCCESS! Your API Endpoints Are Live:**

- `https://yourdomain.com/api/auth/register` - Register new users
- `https://yourdomain.com/api/auth/login` - User login
- `https://yourdomain.com/api/posts/feed` - Get posts feed
- `https://yourdomain.com/api/users/search` - Search users

## 🚨 **If Something Goes Wrong:**

### Error: "Cannot find module"
**Fix**: Run "npm install" again in Node.js panel

### Error: "Database connection failed" 
**Fix**: Double-check your database host in Hostinger → Databases

### Error: "Application won't start"
**Fix**: Check logs in Node.js panel → View Logs

### Error: "404 Not Found"
**Fix**: Make sure your domain is properly pointed to the Node.js app

---

## 📝 **Quick Checklist Before Upload:**

- [ ] Created OEL-CHAT-UPLOAD folder
- [ ] Copied all necessary files
- [ ] Renamed .env.hostinger to .env
- [ ] Password is set to: Ledi1234?
- [ ] Ready to upload to Hostinger!

**Need help with any step?** Just ask! You're almost there! 🚀
