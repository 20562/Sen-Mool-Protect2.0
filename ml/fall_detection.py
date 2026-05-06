#!/usr/bin/env python3
"""
SEN-MOOL PROTECT 2.0 - Fall Detection ML Model
Detects sudden falls based on accelerometer data
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle
import json
from collections import deque
import requests
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import os

load_dotenv()

class FallDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.window_size = 20  # 2 seconds at 10Hz
        self.data_buffer = deque(maxlen=self.window_size)
        self.threshold = 0.7
        self.load_model()
        
    def load_model(self):
        """Load pre-trained model or create new one"""
        try:
            with open('models/fall_detector.pkl', 'rb') as f:
                self.model = pickle.load(f)
            print("[INFO] Fall detection model loaded")
        except FileNotFoundError:
            print("[WARN] Model not found. Training new model...")
            self.train_model()
    
    def train_model(self):
        """Train fall detection model with synthetic data"""
        # Synthetic training data
        # Feature: [accel_x, accel_y, accel_z, magnitude, rate_of_change]
        
        normal_data = np.random.normal(0, 0.5, (1000, 5))
        normal_labels = np.zeros(1000)
        
        fall_data = np.concatenate([
            np.random.uniform(-3, 3, (500, 3)),  # accel
            np.random.uniform(3, 5, (500, 1)),   # magnitude
            np.random.uniform(2, 4, (500, 1))    # rate
        ], axis=1)
        fall_labels = np.ones(500)
        
        X = np.vstack([normal_data, fall_data])
        y = np.hstack([normal_labels, fall_labels])
        
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_scaled, y)
        
        os.makedirs('models', exist_ok=True)
        with open('models/fall_detector.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        print("[INFO] Model trained and saved")
    
    def extract_features(self, accel_x, accel_y, accel_z):
        """Extract features from accelerometer data"""
        magnitude = np.sqrt(accel_x**2 + accel_y**2 + accel_z**2)
        rate_of_change = abs(magnitude - np.mean([abs(x) for x in self.data_buffer])) if self.data_buffer else 0
        
        return np.array([accel_x, accel_y, accel_z, magnitude, rate_of_change])
    
    def predict(self, accel_data):
        """Predict if movement is a fall"""
        self.data_buffer.append(accel_data)
        
        if len(self.data_buffer) < self.window_size:
            return {'is_fall': False, 'confidence': 0.0}
        
        # Extract features from buffer
        features = np.array([
            self.extract_features(x[0], x[1], x[2]) for x in list(self.data_buffer)
        ])
        
        # Aggregate features
        X = np.array([[
            np.mean(features[:, 0]),
            np.mean(features[:, 1]),
            np.mean(features[:, 2]),
            np.max(features[:, 3]),
            np.max(features[:, 4])
        ]])
        
        X_scaled = self.scaler.transform(X)
        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0][1]
        
        return {
            'is_fall': prediction == 1 and probability > self.threshold,
            'confidence': float(probability)
        }

class MLService:
    def __init__(self):
        self.detector = FallDetector()
        self.mqtt_client = mqtt.Client()
        self.setup_mqtt()
        self.api_url = os.getenv('API_URL', 'http://localhost:3000')
    
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
        """Process incoming accelerometer data"""
        try:
            payload = json.loads(msg.payload.decode())
            
            if 'accel' in payload:
                accel = payload['accel']
                result = self.detector.predict(accel)
                
                if result['is_fall']:
                    self.report_fall(payload['id'], result['confidence'])
                    print(f"[ALERT] Fall detected! Device: {payload['id']}, Confidence: {result['confidence']:.2%}")
        except Exception as e:
            print(f"[ERROR] Failed to process message: {e}")
    
    def report_fall(self, device_id, confidence):
        """Send fall detection alert to backend"""
        try:
            alert_data = {
                "device_id": device_id,
                "type": "FALL_DETECTED",
                "confidence": confidence,
                "timestamp": pd.Timestamp.now().isoformat()
            }
            
            response = requests.post(
                f"{self.api_url}/api/alerts",
                json=alert_data,
                timeout=5
            )
            
            if response.status_code == 201:
                print(f"[OK] Fall alert reported")
            else:
                print(f"[ERROR] Failed to report fall: {response.status_code}")
        except Exception as e:
            print(f"[ERROR] Failed to send alert: {e}")
    
    def run(self):
        """Start the ML service"""
        print("[INFO] ML Service started. Listening for data...")
        try:
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[INFO] Shutting down...")
            self.mqtt_client.loop_stop()

if __name__ == "__main__":
    service = MLService()
    service.run()
