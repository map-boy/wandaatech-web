import { ML_MODELS, API_BASE_URL } from './constants/ml-models';

export interface PredictionResponse {
  prediction?: string | string[];
  result?: string;
  risk?: number;
  is_fake?: boolean;
}

/**
 * Handles communication with the WandaaTech FastAPI ML backend on Vercel
 */
export const predictModel = async (modelId: string, input: string): Promise<string> => {
  const model = ML_MODELS.find((m) => m.id === modelId);
  
  if (!model) {
    throw new Error('Model configuration not found.');
  }

  // FIXED: Added /api/ to the URL to match your Vercel backend route
  let url = `${API_BASE_URL}/api/predict/${modelId}`;
  let bodyData: any;

  try {
    if (modelId === 'sonar' || modelId === 'wine') {
      // These models expect a simple array of numbers [0.1, 0.2, ...]
      bodyData = input.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
    } 
    else if (modelId === 'fakenews') {
      // Fake news expects text as a query parameter
      url = `${API_BASE_URL}/api/predict/fakenews?text=${encodeURIComponent(input)}`;
      bodyData = null; 
    } 
    else {
      // Default for other models
      bodyData = { data: input };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyData ? JSON.stringify(bodyData) : undefined,
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(errorDetail || 'Neural Engine execution failed.');
    }

    const data: PredictionResponse = await response.json();

    // Mapping the Python keys to your Frontend text
    if (modelId === 'sonar') return data.result || "Unknown";
    if (modelId === 'fakenews') return data.is_fake ? "FAKE NEWS" : "REAL NEWS";
    
    return String(data.result || data.prediction || "Success");

  } catch (error: any) {
    console.error('ML Service Error:', error);
    throw new Error(error.message || 'Connection to Neural Engine failed');
  }
};