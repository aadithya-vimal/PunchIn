# 🎓 Punch.In Scholar Companion

A modern, feature-rich attendance tracking and academic management application built with React, Firebase, and Tailwind CSS.

![Punch.In Scholar Companion](https://img.shields.io/badge/React-19.1.1-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange)
![Vite](https://img.shields.io/badge/Vite-7.1.5-purple)

## ✨ Features

- 📊 **Smart Attendance Tracking** - Track attendance with percentage calculations and daily status
- 📅 **Timetable Management** - Organize your weekly schedule with ease
- 🎯 **Subject Management** - Add, edit, and remove subjects dynamically
- 📈 **Performance Analytics** - View overall attendance statistics
- 🔐 **Secure Authentication** - Google Sign-In and Email/Password authentication
- 💾 **Real-time Sync** - All data synced with Firebase Firestore
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aadithya-vimal/PunchIn.git
   cd PunchIn/react-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy your Firebase configuration

4. **Configure environment variables**
   
   Create a `.env.local` file in the `react-app` directory:
   ```env
   VITE_API_KEY="your-firebase-api-key"
   VITE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_PROJECT_ID="your-project-id"
   VITE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_APP_ID="your-app-id"
   VITE_MEASUREMENT_ID="G-YOUR-ID"
   ```

5. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Credentials**
   - Add `http://localhost:5173` to **Authorized JavaScript origins**
   - Update the OAuth client ID in `src/pages/LoginPage.jsx` (line 36)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
react-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── SubjectList.jsx
│   │   ├── EditSubjectsModal.jsx
│   │   ├── AttendanceOverview.jsx
│   │   └── ...
│   ├── context/            # React Context providers
│   │   ├── UserContext.jsx
│   │   └── AIContext.jsx
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── ...
│   ├── firebase/           # Firebase configuration
│   │   └── config.js
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
├── package.json
└── vite.config.js
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password authentication
   - Enable Google authentication
   - Add authorized domains in Firebase Console

2. **Firestore Database**
   - Create a database in production mode
   - Set up security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Google OAuth Setup

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized origins:
   - `http://localhost:5173` (development)
   - Your production URL (when deployed)
3. Update the client ID in `src/pages/LoginPage.jsx`

## 📦 Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd react-app
   vercel
   ```

3. Add environment variables in Vercel dashboard

4. Update Firebase authorized domains with your Vercel URL

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

## 🐛 Debugging & Fixes

This version includes several critical fixes:

- ✅ **"Only Monday" Bug Fix** - Subjects editing no longer deletes timetable data
- ✅ **Performance Optimization** - Debounced Firebase saves (1.5s delay)
- ✅ **Optimistic UI Updates** - Instant UI feedback without waiting for Firebase
- ✅ **Security Improvements** - Removed client-side admin checks
- ✅ **Centralized Modal Management** - Better state management

For detailed information about fixes, see the development documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Aadithya Vimal**
- Email: aadithyavimal.work@gmail.com
- GitHub: [@aadithya-vimal](https://github.com/aadithya-vimal)

## 🙏 Acknowledgments

- Firebase for backend services
- React team for the amazing framework
- Tailwind CSS for styling
- Vite for blazing fast development

---

**Note**: Remember to keep your `.env.local` file secure and never commit it to version control. The `.gitignore` file is already configured to exclude it.
