# OEL Chat API Testing Guide

## Prerequisites
1. Update `.env` file with your Hostinger MySQL database credentials
2. Make sure the server is running: `npm run dev`

## Testing with Postman or any REST Client

### 1. Register a New User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

### 2. Login User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "identifier": "testuser",
  "password": "password123"
}
```
Save the returned JWT token for authenticated requests.

### 3. Get Current User (Authenticated)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Update Profile (Authenticated)
```
PUT http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "bio": "Hello, I'm using OEL Chat!",
  "website": "https://example.com"
}
```

### 5. Create a Post (Authenticated)
```
POST http://localhost:5000/api/posts
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "caption": "My first post on OEL Chat! 🎉",
  "location": "New York, NY"
}
```

### 6. Get Posts Feed (Authenticated)
```
GET http://localhost:5000/api/posts/feed?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 7. Search Users (Authenticated)
```
GET http://localhost:5000/api/users/search?q=test
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## File Upload Testing

### Upload Profile Picture
```
POST http://localhost:5000/api/users/profile/picture
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
- profilePicture: [SELECT IMAGE FILE]
```

### Create Post with Media
```
POST http://localhost:5000/api/posts
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
- caption: "Check out this photo!"
- media: [SELECT IMAGE/VIDEO FILE]
```

## Socket.IO Testing (Browser Console)
```javascript
// Connect to Socket.IO server
const socket = io('http://localhost:5000');

// User comes online
socket.emit('user_online', 1); // Replace 1 with actual user ID

// Join a chat
socket.emit('join_chat', 'user1_user2');

// Send a message
socket.emit('send_message', {
  chatId: 'user1_user2',
  senderId: 1,
  receiverId: 2,
  message: 'Hello!'
});

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});
```

## Database Verification
Once you start the server, check your MySQL database for the following tables:
- Users
- Posts
- Likes
- Comments
- Follows
- Messages
- Notifications

## Common Issues
1. **Database Connection Error**: Verify your `.env` database credentials
2. **File Upload Fails**: Ensure `uploads/` directory exists and has write permissions
3. **JWT Token Expired**: Re-login to get a fresh token
4. **CORS Issues**: Make sure `CLIENT_URL` is set correctly in `.env`

## Next Steps for Frontend Development
1. Create React app in `/client` directory
2. Install Axios for API calls
3. Install Socket.IO client for real-time features
4. Create authentication context
5. Build UI components for posts, messages, profiles
6. Implement routing with React Router
