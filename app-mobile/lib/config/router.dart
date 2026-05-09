import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:senmool_mobile/features/auth/presentation/screens/login_screen.dart';
import 'package:senmool_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:senmool_mobile/features/map/presentation/screens/map_screen.dart';
import 'package:senmool_mobile/features/alerts/presentation/screens/alerts_screen.dart';
import 'package:senmool_mobile/features/profile/presentation/screens/profile_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
        routes: [
          GoRoute(
            path: 'map',
            builder: (context, state) => const MapScreen(),
          ),
          GoRoute(
            path: 'alerts',
            builder: (context, state) => const AlertsScreen(),
          ),
          GoRoute(
            path: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
