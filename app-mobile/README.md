# SEN-MOOL PROTECT - Flutter Mobile App

## Setup Instructions

### Prerequisites
- Flutter 3.0+
- Dart 3.0+
- Firebase CLI
- Android Studio / Xcode

### Installation

1. **Install dependencies**
```bash
cd app-mobile
flutter pub get
```

2. **Generate code files (freezed models)**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

3. **Configure Firebase**
```bash
flutterfire configure
```

4. **Run the app**
```bash
flutter run
```

## Project Structure

```
lib/
├── config/              # App configuration
│   ├── app_config.dart  # Firebase, Sentry setup
│   ├── theme.dart       # UI theme constants
│   ├── router.dart      # Navigation routes
│   └── firebase_options.dart
├── features/            # Feature-based modules
│   ├── auth/            # Authentication
│   ├── home/            # Home/Dashboard
│   ├── map/             # Real-time map
│   ├── alerts/          # Alert management
│   └── profile/         # User profile
├── data/                # Data layer
│   ├── models/          # Data models (freezed)
│   └── repositories/    # API repositories
├── services/            # External services
│   ├── websocket_service.dart    # Socket.io
│   ├── notification_service.dart # Firebase notifications
│   └── api_service.dart          # HTTP client
├── providers/           # Riverpod state management
├── constants/           # App constants
└── main.dart            # App entry point
```

## Features

### ✅ Implemented
- [x] Login/Authentication screen
- [x] Bottom navigation (Dashboard, Map, Alerts, Profile)
- [x] Home dashboard with fishermen count
- [x] State management with Riverpod
- [x] WebSocket service integration
- [x] Firebase push notifications
- [x] Theme configuration (light/dark mode)
- [x] Responsive design

### 🔲 To Implement
- [ ] Google Maps integration
- [ ] Real-time fisherman tracking
- [ ] Live alert notifications
- [ ] Fisherman detail screen
- [ ] Settings screen
- [ ] Offline support with local storage
- [ ] Unit tests
- [ ] Integration tests

## Environment Variables

Create a `.env` file in the project root:

```env
API_BASE_URL=http://your-backend-url:3000
WS_URL=http://your-backend-url:3000
ENVIRONMENT=development
SENTRY_DSN=your-sentry-dsn
```

## Build

### Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `flutter test`
4. Submit a PR

## Dependencies

- **UI**: Flutter 3.0+, Google Maps, SVG support
- **Networking**: Socket.io for real-time, Dio for HTTP
- **State Management**: Riverpod, Provider
- **Storage**: Shared Preferences, Hive
- **Notifications**: Firebase Messaging, Local Notifications
- **Authentication**: JWT via HTTP headers
