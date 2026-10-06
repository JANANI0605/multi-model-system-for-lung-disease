// Live Python ML & REST API Client for LungAI

const API_BASE_URL = 'http://127.0.0.1:5000';

// 1. Text ML Model Inference
export async function fetchMlPredictions(clinicalText) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.warn('[LungAI Text ML API] Fallback activated:', error.message);
    return null;
  }
}

// 2. Image Model Inference
export async function fetchVitImagePredictions(imageDataOrCondition) {
  try {
    const payload = typeof imageDataOrCondition === 'string' && imageDataOrCondition.startsWith('data:image')
      ? { image: imageDataOrCondition }
      : { condition: imageDataOrCondition || '' };

    const response = await fetch(`${API_BASE_URL}/api/predict-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      modelLoaded: data.model_loaded || 'ML_models/img_model (Radiograph Model)',
      totalClasses: data.total_classes_evaluated || 15,
      top5Diseases: data.top_5_diseases || [],
      allPredictions: data.all_predictions || []
    };
  } catch (error) {
    console.warn('[LungAI ML API] Fallback activated:', error.message);
    return null;
  }
}

// 3. Patient Records API
export async function fetchPatientsFromDb() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patients`);
    if (!response.ok) throw new Error('Failed to fetch patients from database');
    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.warn('[Patient Records API] Fetch patients fallback:', error.message);
    return null;
  }
}

export async function fetchPatientByIdFromDb(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patients/${encodeURIComponent(patientId)}`);
    if (!response.ok) throw new Error('Patient not found in database');
    const data = await response.json();
    return data.patient || null;
  } catch (error) {
    console.warn('[Patient Records API] Fetch patient by ID fallback:', error.message);
    return null;
  }
}

export async function savePatientRecordToDb(patientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patients/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error('Failed to save patient record');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[Patient Records API] Save patient record error:', error.message);
    return null;
  }
}

// 4. User Login & Registration API
export async function loginUserDb(identifier, role = 'patient', password = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mrn: identifier, email: identifier, identifier, role, password }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return data || { status: 'error', message: 'Authentication failed. Please check your credentials.' };
    }
    return data;
  } catch (error) {
    console.warn('[Auth API] Login error:', error.message);
    return null;
  }
}

export async function registerPatientDb(registrationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return data || { status: 'error', message: 'Registration failed. Please check form details.' };
    }
    return data;
  } catch (error) {
    console.warn('[Auth API] Registration error:', error.message);
    return null;
  }
}
