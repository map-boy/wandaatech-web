// lib/constants/ml-models.ts

/**
 * Base URL for the WandaaTech Neural Engine (FastAPI on Vercel)
 * Using an environment variable is preferred for production.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://wandaatech-models.vercel.app';

export interface MLModel {
  id: string;
  name: string;
  category: string;
  description: string;
  placeholder: string;
  expectedInputs?: number;
  inputType: 'numeric' | 'text';
}

export const ML_MODELS: MLModel[] = [
  {
    id: 'sonar',
    name: 'Sonar Mine Detector',
    category: 'Classification',
    inputType: 'numeric',
    expectedInputs: 60,
    description: 'Predicts whether an object is a Rock or a Mine based on 60 sonar frequency returns.',
    placeholder: 'Enter 60 comma-separated values (e.g., 0.02, 0.03, 0.04...)'
  },
  {
    id: 'diabetes',
    name: 'Diabetes Risk Predictor',
    category: 'Medical AI',
    inputType: 'numeric',
    expectedInputs: 8,
    description: 'Analyzes patient metrics to predict the risk of diabetes onset.',
    placeholder: 'Enter: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, Pedigree, Age'
  },
  {
    id: 'fakenews',
    name: 'Fake News Detector',
    category: 'NLP',
    inputType: 'text',
    description: 'Uses Natural Language Processing to identify if a news headline is authentic or fabricated.',
    placeholder: 'Paste the news headline or article snippet here...'
  },
  {
    id: 'wine',
    name: 'Wine Quality Analyst',
    category: 'Regression',
    inputType: 'numeric',
    expectedInputs: 11,
    description: 'Analyzes chemical properties to predict the quality score of wine.',
    placeholder: 'Enter 11 values: acidity, sugar, chlorides, sulfur, density, pH, alcohol...'
  },
  {
    id: 'clothing',
    name: 'Deep Learning Vision',
    category: 'Computer Vision',
    inputType: 'text',
    description: 'Uses MobileNetV2 (ONNX) to classify types of clothing items.',
    placeholder: 'Simulation Mode: Enter clothing description or image metadata...'
  }
];