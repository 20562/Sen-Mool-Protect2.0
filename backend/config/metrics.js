const prometheus = require('prom-client');

// Create a Registry which registers all the metrics
const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const alertCounter = new prometheus.Counter({
  name: 'alerts_total',
  help: 'Total number of alerts',
  labelNames: ['type', 'status'],
  registers: [register],
});

const activeFishermen = new prometheus.Gauge({
  name: 'active_fishermen',
  help: 'Number of active fishermen',
  registers: [register],
});

const mqttMessagesProcessed = new prometheus.Counter({
  name: 'mqtt_messages_processed_total',
  help: 'Total number of MQTT messages processed',
  labelNames: ['device_id', 'message_type'],
  registers: [register],
});

const websocketConnections = new prometheus.Gauge({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

// Middleware to track HTTP request duration
const httpMetricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.url,
        status: res.statusCode,
      },
      duration
    );
  });

  next();
};

module.exports = {
  register,
  httpRequestDuration,
  alertCounter,
  activeFishermen,
  mqttMessagesProcessed,
  websocketConnections,
  httpMetricsMiddleware,
};
