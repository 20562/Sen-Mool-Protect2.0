const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEN-MOOL PROTECT 2.0 API',
      version: '1.0.0',
      description: 'Maritime safety IoT system API for real-time fishermen tracking and alert management',
      contact: {
        name: 'SEN-MOOL PROTECT Team',
        email: 'contact@senmoolprotect.sn',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.senmoolprotect.sn',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: { type: 'string', format: 'objectId' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'supervisor', 'operator', 'fisherman'] },
            permissions: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean', default: true },
            lastLogin: { type: 'string', format: 'date-time' },
          },
        },
        Fisherman: {
          type: 'object',
          required: ['name', 'braceletId'],
          properties: {
            id: { type: 'string', format: 'objectId' },
            name: { type: 'string' },
            braceletId: { type: 'string' },
            status: { type: 'string', enum: ['normal', 'alert', 'sos', 'offline'] },
            lastKnownLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
            assignedSupervisor: { type: 'string', format: 'objectId' },
          },
        },
        Alert: {
          type: 'object',
          required: ['fisherManId', 'type', 'latitude', 'longitude'],
          properties: {
            id: { type: 'string', format: 'objectId' },
            fisherManId: { type: 'string', format: 'objectId' },
            type: { type: 'string', enum: ['SOS', 'FALL', 'ANOMALY', 'IMMERSION'] },
            message: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'acknowledged', 'resolved'] },
            timestamp: { type: 'string', format: 'date-time' },
            acknowledgedBy: { type: 'string', format: 'objectId' },
          },
        },
        DeviceReading: {
          type: 'object',
          required: ['deviceId', 'heartRate', 'temperature'],
          properties: {
            id: { type: 'string', format: 'objectId' },
            deviceId: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            heartRate: { type: 'number' },
            temperature: { type: 'number' },
            isImmersed: { type: 'boolean' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
