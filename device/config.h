#ifndef CONFIG_H
#define CONFIG_H

// Device Configuration
#define DEVICE_NAME "MOOL-Safe Bracelet"
#define FIRMWARE_VERSION "1.0.0"
#define DEVICE_TYPE "WEARABLE_IOT"

// Network Configuration
#define ENABLE_WIFI true
#define ENABLE_GSM true
#define ENABLE_LORA true

// Sensor Configuration
#define HEART_RATE_ENABLED true
#define TEMPERATURE_ENABLED true
#define ACCELEROMETER_ENABLED true
#define IMMERSION_SENSOR_ENABLED true

// Thresholds
#define HEART_RATE_CRITICAL_HIGH 140
#define HEART_RATE_CRITICAL_LOW 40
#define TEMPERATURE_MAX 40.0
#define FALL_DETECTION_THRESHOLD 3
#define IMMERSION_TIMEOUT 5000 // ms

// MQTT Topics
#define MQTT_TOPIC_DATA "mool/bracelet/{device_id}/data"
#define MQTT_TOPIC_ALERT "mool/alerts/{priority}"
#define MQTT_TOPIC_STATUS "mool/bracelet/{device_id}/status"
#define MQTT_TOPIC_COMMAND "mool/bracelet/{device_id}/command"

// Update Intervals (milliseconds)
#define GPS_UPDATE_INTERVAL 5000
#define SENSOR_UPDATE_INTERVAL 2000
#define DATA_PUBLISH_INTERVAL 30000
#define HEARTBEAT_INTERVAL 60000

// Battery Settings
#define BATTERY_VOLTAGE_MIN 3.0
#define BATTERY_VOLTAGE_MAX 4.2
#define LOW_BATTERY_THRESHOLD 3.2

// Mesh Network
#define LORA_FREQUENCY 868E6 // 868 MHz (Europe)
#define LORA_BANDWIDTH 125E3
#define LORA_SPREADING_FACTOR 7
#define LORA_CODING_RATE 5
#define LORA_TX_POWER 20

#endif
