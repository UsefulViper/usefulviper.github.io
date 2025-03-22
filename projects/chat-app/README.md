# Real-time Chat Application

A modern, responsive chat application with real-time messaging, user authentication, channels, and direct messages.

## Features

- **Real-time Messaging**: Messages appear instantly without page refreshes
- **User Authentication**: Secure login via email/password or Google authentication
- **Multiple Channels**: Create and join different conversation channels
- **Direct Messages**: Private conversations between users
- **Typing Indicators**: See when other users are typing
- **File Attachments**: Share PDFs, images, and other documents
- **Read Receipts**: Know when your messages have been read
- **Mobile Responsive**: Works seamlessly across desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme
- **Notifications**: Stay informed about new messages

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Real-time Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Hosting**: Firebase Hosting (for production deployment)

## How It Works

1. **Authentication**: Users can create an account or sign in with Google
2. **Channels**: Browse existing channels or create new ones
3. **Messaging**: Send text messages, file attachments with real-time updates
4. **Direct Messages**: Initiate private conversations with other users
5. **Notifications**: Get notified about new messages and mentions

## Usage

This application is fully client-side and requires Firebase credentials to function properly. For this demo version, Firebase functionality is simulated for demonstration purposes.

In a production environment, you would need to:
1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Update the Firebase configuration in `js/script.js`
4. Deploy to Firebase Hosting or your preferred hosting platform

## Security

- Authentication uses Firebase's secure authentication system
- Firestore security rules would be implemented to ensure users can only access appropriate data
- File uploads are restricted to specific file types and maximum sizes

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 15+
- iOS Safari 11+
- Android Chrome 60+

## License

This project is available under the MIT License.

---

**Note**: This is a portfolio demonstration project. While the frontend is fully functional, the backend Firebase integration is simulated. In a production environment, you would need to set up your own Firebase project. 