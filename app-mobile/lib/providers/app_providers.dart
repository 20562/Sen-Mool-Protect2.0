import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:senmool_mobile/data/models/fisherman.dart';
import 'package:senmool_mobile/data/models/alert.dart';

// State providers for global state management
final fishermanListProvider = StateNotifierProvider<
    FishermanListNotifier,
    AsyncValue<List<Fisherman>>>((ref) {
  return FishermanListNotifier();
});

final alertListProvider =
    StateNotifierProvider<AlertListNotifier, AsyncValue<List<Alert>>>((ref) {
  return AlertListNotifier();
});

final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<User?>>((ref) {
  return CurrentUserNotifier();
});

// State notifiers
class FishermanListNotifier extends StateNotifier<AsyncValue<List<Fisherman>>> {
  FishermanListNotifier() : super(const AsyncValue.loading());

  Future<void> fetchFishermen() async {
    state = const AsyncValue.loading();
    // TODO: Fetch from backend
    state = const AsyncValue.data([]);
  }

  void updateFisherman(Fisherman fisherman) {
    state.whenData((list) {
      final index = list.indexWhere((f) => f.id == fisherman.id);
      if (index != -1) {
        list[index] = fisherman;
        state = AsyncValue.data([...list]);
      }
    });
  }
}

class AlertListNotifier extends StateNotifier<AsyncValue<List<Alert>>> {
  AlertListNotifier() : super(const AsyncValue.loading());

  Future<void> fetchAlerts() async {
    state = const AsyncValue.loading();
    // TODO: Fetch from backend
    state = const AsyncValue.data([]);
  }

  void addAlert(Alert alert) {
    state.whenData((list) {
      state = AsyncValue.data([alert, ...list]);
    });
  }
}

class CurrentUserNotifier extends StateNotifier<AsyncValue<User?>> {
  CurrentUserNotifier() : super(const AsyncValue.data(null));

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    // TODO: Call backend
    state = const AsyncValue.data(null);
  }

  Future<void> logout() async {
    state = const AsyncValue.data(null);
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final String role;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });
}
