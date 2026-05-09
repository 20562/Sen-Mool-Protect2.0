class Constants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );

  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'http://localhost:3000',
  );

  // API endpoints
  static const String loginEndpoint = '/api/auth/login';
  static const String fishermanEndpoint = '/api/fishermen';
  static const String alertsEndpoint = '/api/alerts';
  static const String deviceReadingEndpoint = '/api/readings';

  // WebSocket events
  static const String wsNewAlert = 'alert:new';
  static const String wsLocationUpdate = 'location:update';
  static const String wsSensorReading = 'sensor:reading';
  static const String wsConnectionStatus = 'connection:status';
}
