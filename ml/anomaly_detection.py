#!/usr/bin/env python3
"""
SEN-MOOL PROTECT 2.0 - Anomaly Detection
Detects abnormal heart rate and temperature patterns
"""

import numpy as np
import pandas as pd
from scipy import stats
import json
import requests
from collections import deque
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()

class AnomalyDetector:
    def __init__(self):
        self.window_size = 10  # Last 10 readings
        self.hr_buffer = deque(maxlen=self.window_size)
        self.temp_buffer = deque(maxlen=self.window_size)
        
        # Normal ranges
        self.heart_rate_normal = (60, 100)
        self.heart_rate_critical = (40, 140)
        self.temperature_normal = (36, 37.5)
        self.temperature_critical = (35, 40)
    
    def detect_anomalies(self, device_data):
        """Detect anomalies in sensor data"""
        anomalies = []
        
        # Heart Rate Analysis
        if 'hr' in device_data:
            hr = device_data['hr']
            self.hr_buffer.append(hr)
            
            hr_anomaly = self.analyze_heart_rate(hr)
            if hr_anomaly:
                anomalies.append(hr_anomaly)
        
        # Temperature Analysis
        if 'temp' in device_data:
            temp = device_data['temp']
            self.temp_buffer.append(temp)
            
            temp_anomaly = self.analyze_temperature(temp)
            if temp_anomaly:
                anomalies.append(temp_anomaly)
        
        return anomalies
    
    def analyze_heart_rate(self, hr):
        """Analyze heart rate anomalies"""
        if hr < self.heart_rate_critical[0]:
            return {
                'type': 'CRITICAL_LOW_HEART_RATE',
                'value': hr,
                'priority': 'CRITICAL'
            }
        elif hr > self.heart_rate_critical[1]:
            return {
                'type': 'CRITICAL_HIGH_HEART_RATE',
                'value': hr,
                'priority': 'CRITICAL'
            }
        elif hr < self.heart_rate_normal[0] or hr > self.heart_rate_normal[1]:
            # Check for trend
            if len(self.hr_buffer) >= 3:
                readings = list(self.hr_buffer)
                trend = np.polyfit(range(len(readings)), readings, 1)[0]
                
                if abs(trend) > 5:  # Rapid change
                    return {
                        'type': 'ABNORMAL_HEART_RATE_TREND',
                        'value': hr,
                        'trend': float(trend),
                        'priority': 'HIGH'
                    }
        
        return None
    
    def analyze_temperature(self, temp):
        """Analyze temperature anomalies"""
        if temp < self.temperature_critical[0]:
            return {
                'type': 'HYPOTHERMIA_RISK',
                'value': temp,
                'priority': 'CRITICAL'
            }
        elif temp > self.temperature_critical[1]:
            return {
                'type': 'HYPERTHERMIA_RISK',
                'value': temp,
                'priority': 'CRITICAL'
            }
        elif temp < self.temperature_normal[0] or temp > self.temperature_normal[1]:
            return {
                'type': 'ABNORMAL_TEMPERATURE',
                'value': temp,
                'priority': 'MEDIUM'
            }
        
        return None

class AnomalyService:
    def __init__(self):
        self.detector = AnomalyDetector()
        self.mqtt_client = mqtt.Client()
        self.setup_mqtt()
        self.api_url = os.getenv('API_URL', 'http://localhost:3000')
        self.device_alerts = {}  # Track recent alerts per device
    
    def setup_mqtt(self):
        """Setup MQTT client"""
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        
        broker = os.getenv('MQTT_BROKER', 'localhost')
        port = int(os.getenv('MQTT_PORT', 1883))
        
        self.mqtt_client.connect(broker, port, 60)
        self.mqtt_client.loop_start()
    
    def on_connect(self, client, userdata, flags, rc):
        print(f"[MQTT] Connected with result code {rc}")
        client.subscribe("mool/bracelet/+/data")
    
    def on_message(self, client, userdata, msg):
        """Process sensor data and detect anomalies"""
        try:
            payload = json.loads(msg.payload.decode())
            device_id = payload.get('id')
            
            anomalies = self.detector.detect_anomalies(payload)
            
            for anomaly in anomalies:
                # Prevent alert spam (min 5 min between same alerts)
                if not self.should_alert(device_id, anomaly['type']):
                    continue
                
                self.report_anomaly(device_id, payload, anomaly)
                print(f"[ANOMALY] {anomaly['type']} - Device: {device_id}")
        except Exception as e:
            print(f"[ERROR] Failed to process message: {e}")
    
    def should_alert(self, device_id, alert_type):
        """Check if we should send alert (rate limiting)"""
        key = f"{device_id}:{alert_type}"
        now = datetime.now()
        
        if key not in self.device_alerts:
            self.device_alerts[key] = now
            return True
        
        last_alert = self.device_alerts[key]
        if (now - last_alert).total_seconds() > 300:  # 5 minutes
            self.device_alerts[key] = now
            return True
        
        return False
    
    def report_anomaly(self, device_id, device_data, anomaly):
        """Send anomaly alert to backend"""
        try:
            alert_data = {
                "device_id": device_id,
                "type": anomaly['type'],
                "value": anomaly['value'],
                "priority": anomaly['priority'],
                "lat": device_data.get('lat'),
                "lon": device_data.get('lon'),
                "timestamp": datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.api_url}/api/alerts",
                json=alert_data,
                timeout=5
            )
            
            if response.status_code == 201:
                print(f"[OK] Anomaly alert reported")
        except Exception as e:
            print(f"[ERROR] Failed to send anomaly alert: {e}")
    
    def run(self):
        """Start the anomaly detection service"""
        print("[INFO] Anomaly Detection Service started")
        try:
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[INFO] Shutting down...")
            self.mqtt_client.loop_stop()

if __name__ == "__main__":
    service = AnomalyService()
    service.run()
