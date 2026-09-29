// Live Python ML REST API Client for LungAI (ML_models/text_model.joblib)

const API_BASE_URL = 'http://127.0.0.1:5000';

export async function fetchMlPredictions(clinicalText) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: clinicalText || '' }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      modelLoaded: data.model_loaded || 'text_model.joblib',
      featuresProcessed: data.n_features_processed || 768,
      symptomsAnalyzed: data.symptoms_analyzed || [],
      top5Diseases: data.top_5_diseases || [],
    };
  } catch (error) {
    console.warn('[LungAI ML API] Offline fallback activated:', error.message);
    return null;
  }
}
