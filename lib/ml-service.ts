import { ML_MODELS, API_BASE_URL } from './constants/ml-models';

export interface PredictionResponse {
  prediction: string | string[];
  status?: string;
}

/**
 * Handles communication with the FastAPI ML backend
 */
export const predictModel = async (modelId: string, input: string): Promise<string> => {
  const model = ML_MODELS.find((m) => m.id === modelId);
  
  if (!model) {
    throw new Error('Model configuration not found.');
  }

  let bodyData: any = {};

  // 1. Prepare data based on model type
  if (model.inputType === 'numeric') {
    // Convert comma-separated string into an array of floats
    const features = input
      .split(',')
      .map((num) => parseFloat(num.trim()))
      .filter((num) => !isNaN(num));

    // Optional: Validation check for Sonar (60) or Diabetes (8) inputs
    if (model.expectedInputs && features.length !== model.expectedInputs) {
      throw new Error(`Expected ${model.expectedInputs} values, but received ${features.length}.`);
    }

    bodyData = { features };
  } else {
    // NLP model (Fake News)
    bodyData = { text: input };
  }

  // 2. Execute the request
  try {
    const response = await fetch(`${API_BASE_URL}/predict/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(errorDetail || 'Failed to fetch prediction from server.');
    }

    const data: PredictionResponse = await response.json();

    // 3. Normalize the result
    // Handles formats like ["R"] or just "Fake"
    if (Array.isArray(data.prediction)) {
      return String(data.prediction[0]);
    }
    
    return String(data.prediction);
  } catch (error: any) {
    console.error('ML Service Error:', error);
    throw error;
  }
};