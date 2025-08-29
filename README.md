<<<<<<< HEAD
# Meditation Program Platform

A comprehensive meditation program management platform with video content, built with React, TypeScript, and Firebase.

## Features

- **Dynamic Side Panel**: Browse and select meditation programs
- **Video Player**: Custom video player with full-screen mode and adjustable playback speed
- **Program Management**: CRUD operations for programs, pages, and videos
- **Admin Dashboard**: Complete admin interface for content management
- **Firebase Integration**: Real-time data synchronization
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Firebase Storage (for future video uploads)
4. Get your Firebase configuration
5. Update `src/config/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users for demo purposes
    // In production, implement proper authentication and authorization
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Running the Application

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser and navigate to the local server URL

## Usage

### User Mode
- Select a meditation program from the sidebar
- Follow the instructions for each page
- Watch videos with custom controls (play/pause, speed adjustment, full-screen)
- Complete all videos on a page to unlock the next page

### Admin Mode
- Click "Admin Dashboard" in the sidebar
- Create new meditation programs
- Add pages with instructions and videos
- Edit existing programs and content
- Delete programs when needed

## Video Requirements

Videos should be hosted on platforms that support direct URL access:
- YouTube (use embed URLs)
- Vimeo
- Direct MP4 URLs
- Other streaming platforms with direct access

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Video Player**: React Player
- **Backend**: Firebase Firestore
- **Build Tool**: Vite
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── VideoPlayer.tsx      # Custom video player component
│   ├── ProgramPage.tsx      # Program page with videos
│   ├── SidePanel.tsx        # Navigation sidebar
│   └── AdminDashboard.tsx   # Admin interface
├── services/
│   └── firebaseService.ts   # Firebase operations
├── config/
│   └── firebase.ts          # Firebase configuration
├── types/
│   └── index.ts            # TypeScript interfaces
└── App.tsx                 # Main application component
```

## Future Enhancements

- User authentication and progress tracking
- Video upload functionality
- Progress analytics dashboard
- Mobile app companion
- Offline mode support
- Advanced video annotations
- Community features
=======
# Guided_Meditation
>>>>>>> main
