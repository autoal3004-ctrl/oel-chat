# Railway Deployment Guide for OEL Chat

## Step-by-Step Railway Deployment

### Prerequisites
- GitHub account
- Railway account
- Your OEL Chat project ready

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "Sign in" or "Sign up" if you don't have an account
3. Once logged in, click the "+" icon in the top right corner
4. Select "New repository"
5. Repository settings:
   - Repository name: `oel-chat`
   - Description: `Instagram-like social media app with real-time chat`
   - Set to Public (free tier requirement)
   - ✅ Check "Add a README file"
   - Click "Create repository"

### Step 2: Upload Your Code to GitHub

There are two ways to do this:

#### Option A: Web Interface (Easier)
1. In your new repository, click "uploading an existing file"
2. Drag and drop all your project files (except node_modules and .env)
3. Write commit message: "Initial commit - OEL Chat backend"
4. Click "Commit changes"

#### Option B: Git Commands (if you have Git installed)
```bash
git clone https://github.com/YOUR_USERNAME/oel-chat.git
cd oel-chat
# Copy all your files here
git add .
git commit -m "Initial commit - OEL Chat backend"
git push origin main
```

### Step 3: Sign Up for Railway

1. Go to [Railway](https://railway.app)
2. Click "Login" 
3. Choose "Login with GitHub" (this connects your accounts)
4. Authorize Railway to access your GitHub account

### Step 4: Create New Project on Railway

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `oel-chat` repository
4. Click "Deploy Now"

### Step 5: Configure Environment Variables

1. In your Railway project dashboard, click on your service
2. Go to "Variables" tab
3. Add these environment variables:

```
NODE_ENV=production
PORT=3000
DB_HOST=srv1478.hstgr.io
DB_USER=u654741053_OELCHAT
DB_PASSWORD=Ledi1234?
DB_NAME=u654741053_OELCHAT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
CLIENT_URL=https://your-app-name.up.railway.app
```

### Step 6: Add Railway Configuration Files

Create these files in your project:

#### railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "always"
```

#### Dockerfile (optional, Railway will auto-detect)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 7: Update package.json Scripts

Make sure your package.json has:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 8: Deploy and Monitor

1. Push any changes to GitHub
2. Railway will automatically redeploy
3. Check the "Deployments" tab for build logs
4. Once deployed, click "View Logs" to see if everything started correctly

### Step 9: Get Your App URL

1. In Railway dashboard, go to "Settings" tab
2. Under "Environment", you'll see your app URL
3. It will look like: `https://oel-chat-production-xxxx.up.railway.app`

### Step 10: Test Your Deployment

1. Visit your app URL
2. Test API endpoints:
   - `GET /api/test` - Should return "Server is running!"
   - `POST /api/auth/register` - Test user registration
   - Check logs for any errors

## Important Notes

- Railway free tier gives you $5/month credit
- Your app will sleep after 30 minutes of inactivity (free tier)
- Database is already hosted on Hostinger, so no additional DB setup needed
- All environment variables are securely stored in Railway

## Troubleshooting

- If build fails, check the build logs in Railway
- If app crashes, check the application logs
- Make sure all dependencies are in package.json
- Verify environment variables are set correctly

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Create React frontend
3. Set up CI/CD for automatic deployments
4. Monitor application performance
