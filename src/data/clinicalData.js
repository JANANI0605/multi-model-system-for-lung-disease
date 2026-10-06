// Dynamic Database Configuration - All static patient presets deleted as requested.
export const PATIENT_PRESETS = [];

export const SYSTEM_MODELS = {
  textModel: {
    name: 'Clinical Symptom Analysis Model',
    version: 'v2.4',
    features: 768,
    file: 'text_model.joblib'
  },
  visionModel: {
    name: 'Chest X-Ray Imaging Model',
    version: 'v1.8',
    resolution: '224x224',
    directory: 'ML_models/img_model'
  }
};
