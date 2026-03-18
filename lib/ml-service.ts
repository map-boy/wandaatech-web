import { ML_MODELS, API_BASE_URL } from './constants/ml-models';

export interface PredictionResponse {
  prediction?: string | string[];
  result?: string;
  risk?: number;
  is_fake?: boolean;
  label?: string;
}

/**
 * Handles communication with the WandaaTech FastAPI ML backend on Vercel
 */
export const predictModel = async (modelId: string, input: string): Promise<string> => {
  const model = ML_MODELS.find((m) => m.id === modelId);
  
  if (!model) {
    throw new Error('Model configuration not found.');
  }

  // 1. Prepare data and URL based on model requirements
  let bodyData: any;
  // Crucial: Added /api prefix for Vercel routing
  let url = `${API_BASE_URL}/api/predict/${modelId}`;

  try {
    if (modelId === 'sonar' || modelId === 'wine') {
      // These models expect a flat array of numbers
      const features = input
        .split(',')
        .map((num) => parseFloat(num.trim()))
        .filter((num) => !isNaN(num));

      if (model.expectedInputs && features.length !== model.expectedInputs) {
        throw new Error(`Expected ${model.expectedInputs} values, but received ${features.length}.`);
      }
      bodyData = features;
    } 
    else if (modelId === 'diabetes') {
      // Expects a JSON object with specific health metric keys
      const vals = input.split(',').map(num => parseFloat(num.trim()));
      bodyData = {
        "Pregnancies": vals[0], "Glucose": vals[1], "BloodPressure": vals[2],
        "SkinThickness": vals[3], "Insulin": vals[4], "BMI": vals[5],
        "DiabetesPedigreeFunction": vals[6], "Age": vals[7]
      };
    } 
    else if (modelId === 'fakenews') {
      // FastAPI backend expects text as a query parameter
      url = `${API_BASE_URL}/api/predict/fakenews?text=${encodeURIComponent(input)}`;
      bodyData = null; 
    } 
    else {
      bodyData = { text: input };
    }

    // 2. Execute the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyData ? JSON.stringify(bodyData) : undefined,
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(errorDetail || 'Neural Engine execution failed.');
    }

    const data: PredictionResponse = await response.json();

    // 3. Normalize the result based on your Backend return keys
    if (modelId === 'sonar') return data.result || "Unknown";
    if (modelId === 'diabetes') return data.risk === 1 ? "DIABETES POSITIVE" : "DIABETES NEGATIVE";
    if (modelId === 'fakenews') return data.is_fake ? "FAKE NEWS DETECTED" : "REAL NEWS";
    if (modelId === 'clothing') return data.label || "UNIDENTIFIED";
    
    // Fallback for general prediction responses
    if (data.prediction) {
      return Array.isArray(data.prediction) ? String(data.prediction[0]) : String(data.prediction);
    }

    return String(data.result || "Process Complete");

  } catch (error: any) {
    console.error('ML Service Error:', error);
    throw new Error(error.message || 'Connection to Neural Engine failed');
  }
};