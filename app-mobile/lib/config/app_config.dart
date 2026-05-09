import 'package:firebase_core/firebase_core.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'firebase_options.dart';

class AppConfig {
  static Future<void> initialize() async {
    // Initialize Firebase
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    // Initialize Sentry for error tracking
    await SentryFlutter.init(
      (options) {
        options.dsn = const String.fromEnvironment(
          'SENTRY_DSN',
          defaultValue: '',
        );
        options.environment = const String.fromEnvironment(
          'ENVIRONMENT',
          defaultValue: 'development',
        );
      },
      appRunner: () async {
        // App is initialized here
      },
    );
  }
}
