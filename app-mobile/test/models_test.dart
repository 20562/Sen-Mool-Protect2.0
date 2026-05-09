import 'package:flutter_test/flutter_test.dart';
import 'package:senmool_mobile/data/models/fisherman.dart';
import 'package:senmool_mobile/data/models/alert.dart';

void main() {
  group('Data Models Tests', () {
    test('Fisherman model should serialize/deserialize correctly', () {
      final json = {
        'id': '1',
        'name': 'John Doe',
        'latitude': 14.6928,
        'longitude': -17.0469,
        'heartRate': 72.5,
        'temperature': 37.2,
        'status': 'normal',
        'lastUpdate': '2026-05-09T10:30:00Z',
        'isImmersed': false,
      };

      final fisherman = Fisherman.fromJson(json);
      expect(fisherman.name, 'John Doe');
      expect(fisherman.status, 'normal');
      expect(fisherman.isImmersed, false);
    });

    test('Alert model should serialize/deserialize correctly', () {
      final json = {
        'id': 'alert-1',
        'fisherManId': '1',
        'type': 'SOS',
        'message': 'Distress signal received',
        'timestamp': '2026-05-09T10:30:00Z',
        'latitude': 14.6928,
        'longitude': -17.0469,
        'status': 'pending',
      };

      final alert = Alert.fromJson(json);
      expect(alert.type, 'SOS');
      expect(alert.status, 'pending');
      expect(alert.message, 'Distress signal received');
    });
  });
}
