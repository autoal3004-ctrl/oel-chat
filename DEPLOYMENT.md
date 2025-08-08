# Deployment Instructions for Hostinger

## Pre-deployment Checklist
- [ ] Database credentials updated in .env
- [ ] JWT_SECRET changed to production value  
- [ ] CLIENT_URL set to your domain
- [ ] All dependencies listed in package.json
- [ ] File upload directories created

## Step-by-Step Hostinger Deployment

### 1. Database Setup
1. Go to Hostinger Control Panel → Databases
2. Your MySQL database is already created: `u654741053_OELCHAT`
3. Note down the connection details:
   - Host: (provided by Hostinger)
   - Database: u654741053_OELCHAT
   - Username: u654741053_OELCHAT
   - Password: (set by you)

### 2. File Upload Methods

#### Option A: File Manager
1. Hostinger Control Panel → File Manager
2. Navigate to `public_html`
3. Create folder: `api` (or your preferred name)
4. Upload all files except `node_modules`
5. Set permissions: 755 for directories, 644 for files

#### Option B: FTP Upload
```
Host: ftp.yourdomain.com
Username: (from Hostinger)
Password: (from Hostinger)
Port: 21
```

#### Option C: Git Deployment
1. Push code to GitHub/GitLab
2. Hostinger Control Panel → Git
3. Connect repository
4. Set auto-deployment

### 3. Install Dependencies on Server
Since Hostinger may not have Node.js by default:

1. Check if Node.js is available in your hosting plan
2. If available, SSH into server and run:
   ```bash
   cd public_html/api
   npm install --production
   ```

### 4. Configure Node.js App
1. Hostinger Control Panel → Node.js
2. Create new Node.js application:
   - Node.js version: Latest LTS
   - Application root: `/public_html/api`
   - Application startup file: `server.js`
   - Application URL: `yourdomain.com/api`

### 5. Environment Variables
1. In Node.js app settings, add environment variables:
   ```
   DB_HOST=your_mysql_host
   DB_NAME=u654741053_OELCHAT  
   DB_USER=u654741053_OELCHAT
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_production_secret
   NODE_ENV=production
   ```

### 6. Start Application
1. Click "Start" in Node.js application manager
2. Monitor logs for any errors
3. Test API endpoints: `https://yourdomain.com/api/auth/register`

### 7. File Permissions & Security
```bash
# Set correct permissions
chmod 755 uploads/
chmod 755 uploads/posts/
chmod 755 uploads/profiles/
chmod 755 uploads/messages/
chmod 600 .env
```

### 8. SSL Certificate
1. Hostinger Control Panel → SSL
2. Enable SSL for your domain
3. Update CLIENT_URL to use https://

## Troubleshooting

### Common Issues:
1. **"Cannot find module"** → Run `npm install` on server
2. **Database connection failed** → Check DB credentials
3. **Permission denied** → Set correct file permissions
4. **CORS errors** → Update CLIENT_URL in .env
5. **File upload fails** → Check uploads directory permissions

### Logs Location:
- Node.js app logs: Hostinger Control Panel → Node.js → View Logs
- Error logs: Check cPanel Error Logs

### Testing After Deployment:
1. Test API: `https://yourdomain.com/api/auth/register`
2. Test file upload endpoints
3. Test database connections
4. Monitor server resources

## Production Optimization

### Performance:
1. Enable gzip compression
2. Use CDN for static files  
3. Implement caching headers
4. Optimize database queries
5. Use connection pooling

### Security:
1. Enable HTTPS only
2. Set secure cookie flags
3. Implement rate limiting
4. Regular security updates
5. Monitor access logs

### Monitoring:
1. Set up error logging
2. Monitor server resources
3. Database performance tracking
4. User activity analytics
