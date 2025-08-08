# OEL Chat - Instagram-like Social Media App

A full-stack social media application similar to Instagram, built with modern web technologies. Features include user authentication, photo/video sharing, real-time messaging, social interactions, and more.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **User Profiles**: Customizable profiles with profile pictures and bio
- **Photo/Video Sharing**: Upload and share media content
- **Social Interactions**: Like, comment, and reply to posts
- **Follow System**: Follow/unfollow users with privacy controls
- **Real-time Messaging**: Direct messaging with Socket.IO
- **Notifications**: Real-time notifications for interactions
- **Search**: Find users by username or name
- **Responsive Design**: Mobile-friendly interface (frontend to be implemented)

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (hosted on Hostinger)
- **Sequelize** - ORM for database operations
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend (To be implemented)
- **React** - Frontend framework
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation

## 📁 Project Structure

```
OEL CHAT/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User model
│   ├── Post.js              # Post model
│   ├── Like.js              # Like model
│   ├── Comment.js           # Comment model
│   ├── Follow.js            # Follow model
│   ├── Message.js           # Message model
│   ├── Notification.js      # Notification model
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── posts.js             # Post management routes
│   ├── comments.js          # Comment routes
│   ├── messages.js          # Messaging routes
│   ├── follows.js           # Follow system routes
│   └── notifications.js     # Notification routes
├── uploads/                 # File storage directory
│   ├── posts/
│   ├── profiles/
│   └── messages/
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main server file
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database (Hostinger account set up)
- npm or yarn package manager

### 1. Clone the repository
```bash
git clone <repository-url>
cd "OEL CHAT"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration (Hostinger MySQL)
DB_HOST=your_hostinger_mysql_hostname
DB_PORT=3306
DB_NAME=u654741053_OELCHAT
DB_USER=u654741053_OELCHAT
DB_PASSWORD=your_database_password_here

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. Database Setup
The application will automatically create the required tables when you start the server for the first time.

### 5. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

### User Endpoints
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/picture` - Upload profile picture
- `GET /api/users/search` - Search users
- `GET /api/users/suggested` - Get suggested users

### Post Endpoints
- `POST /api/posts` - Create new post
- `GET /api/posts/feed` - Get posts feed
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/unlike post
- `DELETE /api/posts/:id` - Delete post

### Comment Endpoints
- `POST /api/comments/:postId` - Add comment to post
- `GET /api/comments/:postId` - Get post comments
- `GET /api/comments/:commentId/replies` - Get comment replies
- `DELETE /api/comments/:id` - Delete comment

### Follow Endpoints
- `POST /api/follows/:userId` - Follow/unfollow user
- `GET /api/follows/requests` - Get follow requests
- `PUT /api/follows/requests/:requestId` - Accept/reject follow request
- `GET /api/follows/:userId/followers` - Get user's followers
- `GET /api/follows/:userId/following` - Get user's following

### Message Endpoints
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message
- `DELETE /api/messages/:messageId` - Delete message
- `PUT /api/messages/:messageId/read` - Mark message as read

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload

Supported file types:
- Images: JPEG, JPG, PNG, GIF
- Videos: MP4, MOV, AVI, WebM
- Audio: MP3, WAV

Maximum file size: 10MB

## ⚡ Real-time Features

Socket.IO events:
- `user_online` - User comes online
- `join_chat` - Join chat room
- `send_message` - Send message
- `new_message` - Receive message
- `typing` - User typing indicator
- `stop_typing` - Stop typing indicator
- `user_status` - User online/offline status

## 🚧 Next Steps

### Frontend Development
1. Set up React application in `/client` directory
2. Implement user interface components
3. Connect to backend API
4. Add Socket.IO client for real-time features
5. Implement responsive design
6. Add routing with React Router

### Additional Backend Features
1. Email notifications
2. Cloud storage integration (Cloudinary)
3. Advanced search functionality
4. Content moderation
5. Analytics and reporting
6. Admin panel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🌐 Deployment

The application is designed to be deployed on Hostinger with the provided MySQL database. Make sure to:

1. Update environment variables for production
2. Configure proper CORS settings
3. Set up SSL certificates
4. Configure domain settings
5. Set up proper file storage

---

**Website**: https://www.autodaj.com
**Created**: August 7, 2025
**Database**: MySQL on Hostinger (u654741053_OELCHAT)
