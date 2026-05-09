import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
import pickle
import json
from datetime import datetime

class FallDetectionModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.threshold = 0.8
        
    def preprocess_data(self, X):
        """Normalize accelerometer data"""
        return self.scaler.fit_transform(X)
    
    def extract_features(self, accel_x, accel_y, accel_z):
        """Extract features from accelerometer data"""
        features = {
            'magnitude': np.sqrt(accel_x**2 + accel_y**2 + accel_z**2),
            'variance_x': np.var(accel_x),
            'variance_y': np.var(accel_y),
            'variance_z': np.var(accel_z),
            'std_x': np.std(accel_x),
            'std_y': np.std(accel_y),
            'std_z': np.std(accel_z),
            'min_accel': min(accel_x.min(), accel_y.min(), accel_z.min()),
            'max_accel': max(accel_x.max(), accel_y.max(), accel_z.max()),
        }
        return pd.Series(features)
    
    def train(self, X_train, y_train):
        """Train the model using Gradient Boosting"""
        X_scaled = self.preprocess_data(X_train)
        
        self.model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        
        self.model.fit(X_scaled, y_train)
        
        # Evaluate with cross-validation
        scores = cross_val_score(self.model, X_scaled, y_train, cv=5)
        print(f"Fall Detection CV Scores: {scores}")
        print(f"Mean Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")
    
    def predict(self, X):
        """Predict fall events"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        X_scaled = self.scaler.transform(X)
        probabilities = self.model.predict_proba(X_scaled)
        predictions = self.model.predict(X_scaled)
        
        # Return prediction with confidence
        return {
            'prediction': predictions,
            'confidence': np.max(probabilities, axis=1),
            'is_fall': probabilities[:, 1] > self.threshold
        }
    
    def save_model(self, filepath):
        """Save trained model"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler,
                'threshold': self.threshold
            }, f)
    
    def load_model(self, filepath):
        """Load trained model"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.scaler = data['scaler']
            self.threshold = data['threshold']


class AnomalyDetectionModel:
    def __init__(self):
        self.hr_model = None
        self.temp_model = None
        self.hr_threshold = 3.0  # Standard deviations
        self.temp_threshold = 2.5
    
    def calculate_statistics(self, heart_rates, temperatures):
        """Calculate mean and std for anomaly detection"""
        return {
            'hr_mean': np.mean(heart_rates),
            'hr_std': np.std(heart_rates),
            'temp_mean': np.mean(temperatures),
            'temp_std': np.std(temperatures),
        }
    
    def detect_anomalies(self, current_hr, current_temp, stats):
        """Detect anomalies using Z-score method"""
        hr_zscore = abs((current_hr - stats['hr_mean']) / (stats['hr_std'] + 1e-5))
        temp_zscore = abs((current_temp - stats['temp_mean']) / (stats['temp_std'] + 1e-5))
        
        is_hr_anomaly = hr_zscore > self.hr_threshold
        is_temp_anomaly = temp_zscore > self.temp_threshold
        
        return {
            'is_anomaly': is_hr_anomaly or is_temp_anomaly,
            'hr_anomaly': is_hr_anomaly,
            'temp_anomaly': is_temp_anomaly,
            'hr_zscore': hr_zscore,
            'temp_zscore': temp_zscore,
        }
    
    def generate_alert(self, reading_id, anomaly_result):
        """Generate anomaly alert"""
        if anomaly_result['is_anomaly']:
            reason = []
            if anomaly_result['hr_anomaly']:
                reason.append(f"Abnormal heart rate (Z-score: {anomaly_result['hr_zscore']:.2f})")
            if anomaly_result['temp_anomaly']:
                reason.append(f"Abnormal temperature (Z-score: {anomaly_result['temp_zscore']:.2f})")
            
            return {
                'reading_id': reading_id,
                'type': 'ANOMALY',
                'severity': 'high' if anomaly_result['hr_zscore'] > 4 else 'medium',
                'reason': ', '.join(reason),
                'timestamp': datetime.now().isoformat(),
            }
        return None
