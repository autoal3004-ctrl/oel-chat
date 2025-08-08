# 📋 EASY HOSTINGER UPLOAD - STEP BY STEP

## ✅ STEP 1: Prepare Files (5 minutes)

### Files to Upload (Copy these to a new folder):
```
📁 OEL-CHAT-UPLOAD/
├── 📁 config/
│   └── database.js
├── 📁 middleware/
│   ├── auth.js
│   └── upload.js
├── 📁 models/
│   ├── User.js
│   ├── Post.js
│   ├── Like.js
│   ├── Comment.js
│   ├── Follow.js
│   ├── Message.js
│   ├── Notification.js
│   └── index.js
├── 📁 routes/
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   ├── comments.js
│   ├── messages.js
│   ├── follows.js
│   └── notifications.js
├── 📁 uploads/
│   ├── 📁 posts/ (empty)
│   ├── 📁 profiles/ (empty)
│   └── 📁 messages/ (empty)
├── .env (production version)
├── package.json
├── server.js
└── README.md
```

### ❌ DO NOT UPLOAD:
- node_modules folder
- .git folder
- .env.example
- Any test files

## ✅ STEP 2: Get Hostinger Database Info (2 minutes)

1. Log into Hostinger account
2. Go to: **Hosting** → **Manage** 
3. Click: **Databases** 
4. Find your database: `u654741053_OELCHAT`
5. Note down:
   - **Host**: (usually something like mysql.hostinger.com)
   - **Database**: u654741053_OELCHAT
   - **Username**: u654741053_OELCHAT
   - **Password**: (you set this when creating database)

## ✅ STEP 3: Update .env File (1 minute)

Copy `.env.production` to `.env` and update:
```env
PORT=3000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

DB_HOST=your_hostinger_mysql_host_here
DB_PORT=3306
DB_NAME=u654741053_OELCHAT
DB_USER=u654741053_OELCHAT
DB_PASSWORD=your_actual_password_here

JWT_SECRET=change_this_to_a_random_long_string_12345
```

## ✅ STEP 4: Upload Files (5 minutes)

1. **Hostinger Control Panel** → **File Manager**
2. **Navigate** to `public_html`
3. **Create New Folder**: `api`
4. **Open** the `api` folder
5. **Upload** all files from your prepared folder
   - You can drag & drop or use Upload button
   - Upload folders one by one if needed

## ✅ STEP 5: Set Up Node.js App (3 minutes)

1. **Hostinger Control Panel** → **Node.js**
2. **Create Application**:
   - **Application root**: `/public_html/api`
   - **Application startup file**: `server.js`
   - **Node.js version**: Latest LTS (18.x or 20.x)
3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   DB_HOST=your_mysql_host
   DB_NAME=u654741053_OELCHAT
   DB_USER=u654741053_OELCHAT
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_secret_key
   ```
4. **Click Save**

## ✅ STEP 6: Install Dependencies (2 minutes)

1. **In Node.js app settings** → **Run npm install**
2. **Or use Terminal** (if available):
   ```bash
   cd /public_html/api
   npm install --production
   ```

## ✅ STEP 7: Start Your App (1 minute)

1. **Node.js Control Panel** → **Start Application**
2. **Check Status**: Should show "Running"
3. **View Logs** if there are any errors

## ✅ STEP 8: Test Your API (2 minutes)

1. **Test URL**: `https://yourdomain.com/api/health`
2. **Should return**:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-08-07T...",
     "uptime": 123,
     "environment": "production"
   }
   ```

## 🎉 STEP 9: Your API is Live!

Your endpoints are now available:
- `https://yourdomain.com/api/auth/register` - Register users
- `https://yourdomain.com/api/auth/login` - User login
- `https://yourdomain.com/api/posts/feed` - Get posts
- And all other endpoints!

## 🚨 TROUBLESHOOTING

### Problem: "Cannot find module"
**Solution**: Run `npm install` in the Node.js control panel

### Problem: "Database connection failed"
**Solution**: Double-check DB credentials in .env

### Problem: "Application won't start"
**Solution**: Check logs in Node.js control panel

### Problem: "404 Not Found"
**Solution**: Make sure your domain points to the Node.js app

---

## 📞 NEED HELP?

If you get stuck on any step:
1. Check the logs in Hostinger Node.js panel
2. Verify your database credentials
3. Make sure all files uploaded correctly
4. Test the health endpoint first

**Total Time**: ~20 minutes
**Difficulty**: ⭐⭐☆☆☆ (Easy)
