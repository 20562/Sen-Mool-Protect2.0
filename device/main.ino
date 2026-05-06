/*
  SEN-MOOL PROTECT 2.0 - Bracelet Maritime IoT
  Firmware ESP32 + GPS + LoRa + Capteurs
  
  Hardware:
  - ESP32 DevKit
  - GPS NEO-6M (Serial UART)
  - LoRa RFM95W (SPI)
  - MPU6050 (I2C) - Accéléromètre
  - MAX30100 (I2C) - Fréquence cardiaque
  - DS18B20 (OneWire) - Température
  - GSM Modem SIM800L (Serial2)
*/

#include <Wire.h>
#include <SPI.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "MAX30100_PulseOximeter.h"
#include "MPU6050.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <PubSubClient.h>
#include <WiFi.h>

// ===== PINS =====
#define GPS_RX 16
#define GPS_TX 17
#define GSM_RX 26
#define GSM_TX 27
#define ONE_WIRE_BUS 25
#define LORA_SS 5
#define LORA_RST 14
#define LORA_DIO0 2
#define BUTTON_SOS 12
#define LED_SOS 13
#define BUZZER 4

// ===== CONFIGURATIONS =====
const char* SSID = "MoolNetwork";
const char* PASSWORD = "***";
const char* MQTT_SERVER = "mqtt.senmool.sn";
const int MQTT_PORT = 1883;
const char* DEVICE_ID = "MOOL-001";

// ===== OBJECTS =====
HardwareSerial gpsSerial(1);
HardwareSerial gsmSerial(2);
TinyGPSPlus gps;
MPU6050 mpu;
MAX30100 heartRate;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ===== VARIABLES =====
struct SensorData {
  float latitude;
  float longitude;
  float temperature;
  int heartRate;
  float accelX, accelY, accelZ;
  bool immersed;
  unsigned long timestamp;
} currentData;

bool sosActivated = false;
int fallDetectionCounter = 0;
const int FALL_THRESHOLD = 3;
const int IMMERSION_THRESHOLD = 1000; // ms

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  gsmSerial.begin(9600, SERIAL_8N1, GSM_RX, GSM_TX);
  
  pinMode(BUTTON_SOS, INPUT_PULLUP);
  pinMode(LED_SOS, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  Serial.println("\n\n=== SEN-MOOL PROTECT 2.0 Bracelet ===");
  Serial.println("Device ID: " + String(DEVICE_ID));
  
  // I2C Sensors
  Wire.begin();
  if (!mpu.begin()) {
    Serial.println("MPU6050 NOT FOUND");
  }
  if (!heartRate.begin()) {
    Serial.println("MAX30100 NOT FOUND");
  }
  
  // Temperature Sensor
  sensors.begin();
  
  // WiFi + MQTT
  connectWiFi();
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
  connectMQTT();
  
  Serial.println("Setup complete. Starting main loop...");
}

// ===== MAIN LOOP =====
void loop() {
  // MQTT Connection
  if (!mqttClient.connected()) {
    if (!connectMQTT()) {
      delay(5000);
      return;
    }
  }
  mqttClient.loop();
  
  // SOS Button Check
  if (digitalRead(BUTTON_SOS) == LOW) {
    sosActivated = true;
    triggerSOS();
  }
  
  // Read GPS
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
  if (gps.location.isUpdated()) {
    currentData.latitude = gps.location.lat();
    currentData.longitude = gps.location.lng();
    Serial.printf("GPS: %.6f, %.6f\n", currentData.latitude, currentData.longitude);
  }
  
  // Read Heart Rate
  if (heartRate.available()) {
    currentData.heartRate = heartRate.getHeartRate();
    Serial.printf("Heart Rate: %d bpm\n", currentData.heartRate);
  }
  
  // Read Temperature
  sensors.requestTemperatures();
  currentData.temperature = sensors.getTempCByIndex(0);
  Serial.printf("Temperature: %.2f C\n", currentData.temperature);
  
  // Read Accelerometer (Fall Detection)
  mpu.getAcceleration(&currentData.accelX, &currentData.accelY, &currentData.accelZ);
  detectFall();
  
  // Immersion Detection (sensor humidity pin)
  currentData.immersed = analogRead(A0) > IMMERSION_THRESHOLD;
  if (currentData.immersed) {
    handleImmersion();
  }
  
  // Store Timestamp
  currentData.timestamp = millis();
  
  // Publish Data every 30s
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 30000) {
    publishData();
    lastPublish = millis();
  }
  
  delay(100);
}

// ===== FUNCTIONS =====

void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s\n", SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi connection failed. Using GSM mode...");
  }
}

bool connectMQTT() {
  Serial.printf("Connecting to MQTT: %s:%d\n", MQTT_SERVER, MQTT_PORT);
  
  if (mqttClient.connect(DEVICE_ID)) {
    Serial.println("MQTT connected!");
    mqttClient.subscribe("mool/bracelet/+/command");
    publishStatus("online");
    return true;
  } else {
    Serial.printf("MQTT failed, rc=%d\n", mqttClient.state());
    return false;
  }
}

void publishData() {
  String topic = "mool/bracelet/" + String(DEVICE_ID) + "/data";
  String payload = "{";
  payload += "\"id\":\"" + String(DEVICE_ID) + "\"";
  payload += ",\"lat\":" + String(currentData.latitude, 6);
  payload += ",\"lon\":" + String(currentData.longitude, 6);
  payload += ",\"temp\":" + String(currentData.temperature, 2);
  payload += ",\"hr\":" + String(currentData.heartRate);
  payload += ",\"accel\":[" + String(currentData.accelX) + "," + String(currentData.accelY) + "," + String(currentData.accelZ) + "]";
  payload += ",\"immersed\":" + String(currentData.immersed ? "true" : "false");
  payload += ",\"ts\":" + String(currentData.timestamp);
  payload += "}";
  
  mqttClient.publish(topic.c_str(), payload.c_str());
  Serial.printf("Published to %s\n", topic.c_str());
}

void publishStatus(const char* status) {
  String topic = "mool/bracelet/" + String(DEVICE_ID) + "/status";
  mqttClient.publish(topic.c_str(), status);
}

void triggerSOS() {
  digitalWrite(LED_SOS, HIGH);
  digitalWrite(BUZZER, HIGH);
  
  String topic = "mool/alerts/sos";
  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\"";
  payload += ",\"type\":\"MANUAL_SOS\"";
  payload += ",\"lat\":" + String(currentData.latitude, 6);
  payload += ",\"lon\":" + String(currentData.longitude, 6);
  payload += ",\"timestamp\":" + String(currentData.timestamp);
  payload += "}";
  
  mqttClient.publish(topic.c_str(), payload.c_str());
  Serial.println("SOS ACTIVATED");
  
  delay(1000);
  digitalWrite(LED_SOS, LOW);
  digitalWrite(BUZZER, LOW);
  sosActivated = false;
}

void detectFall() {
  // Detects sudden drop in acceleration
  float totalAccel = sqrt(pow(currentData.accelX, 2) + pow(currentData.accelY, 2) + pow(currentData.accelZ, 2));
  
  if (totalAccel < 5.0) { // Free fall threshold
    fallDetectionCounter++;
    if (fallDetectionCounter >= FALL_THRESHOLD) {
      publishAlert("FALL_DETECTED");
      fallDetectionCounter = 0;
    }
  } else {
    fallDetectionCounter = 0;
  }
}

void handleImmersion() {
  // Auto-alert after 5 seconds of immersion
  static unsigned long immersionStart = 0;
  
  if (immersionStart == 0) {
    immersionStart = millis();
  }
  
  if (millis() - immersionStart > 5000) {
    publishAlert("IMMERSION_DETECTED");
    immersionStart = 0;
  }
}

void publishAlert(const char* alertType) {
  String topic = "mool/alerts/automatic";
  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\"";
  payload += ",\"type\":\"" + String(alertType) + "\"";
  payload += ",\"lat\":" + String(currentData.latitude, 6);
  payload += ",\"lon\":" + String(currentData.longitude, 6);
  payload += ",\"temp\":" + String(currentData.temperature, 2);
  payload += ",\"hr\":" + String(currentData.heartRate);
  payload += ",\"timestamp\":" + String(currentData.timestamp);
  payload += "}";
  
  mqttClient.publish(topic.c_str(), payload.c_str());
  digitalWrite(BUZZER, HIGH);
  delay(500);
  digitalWrite(BUZZER, LOW);
  
  Serial.printf("ALERT: %s\n", alertType);
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  Serial.printf("MQTT Message on %s: ", topic);
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  
  // Handle remote commands if needed
}
