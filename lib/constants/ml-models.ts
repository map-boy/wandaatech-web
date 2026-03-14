// Base URL for your Python Flask backend
export const API_BASE_URL = 'http://127.0.0.1:5000';

export interface MLModel {
  id: string;
  name: string;
  category: string;
  description: string;
  placeholder: string;
}

export const ML_MODELS: MLModel[] = [
  {
    id: 'sonar',
    name: 'Sonar Mine Detector',
    category: 'Classification',
    description: 'Predicts whether an object is a Rock or a Mine based on sonar data.',
    placeholder: 'Enter 60 comma-separated numerical values (e.g., 0.02, 0.03...)'
  },
  {
    id: 'diabetes',
    name: 'Diabetes Risk Predictor',
    category: 'Medical AI',
    description: 'Predicts diabetes risk based on patient health metrics.',
    placeholder: 'Enter values: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age'
  },
  {
    id: 'fakenews',
    name: 'Fake News Detector',
    category: 'NLP',
    description: 'Determines if a news article headline or body is authentic or fabricated.',
    placeholder: 'Paste the news headline or article body here...'
  },
  {
    id: 'wine',
    name: 'Wine Quality Analyst',
    category: 'Regression',
    description: 'Analyzes chemical properties to predict the quality of wine.',
    placeholder: 'Enter values: fixed acidity, volatile acidity, citric acid, residual sugar, chlorides, free sulfur dioxide, total sulfur dioxide, density, pH, sulphates, alcohol'
  },
  {
    id: 'clothing',
    name: 'Deep Learning Vision',
    category: 'Deep Learning',
    description: 'MobileNetV2 Neural Network for clothing classification.',
    placeholder: 'Enter image pixel data or flattened array for classification...'
  }
];