export const PATIENT_PRESETS = [
  {
    id: "PAT-8092",
    name: "Eleanor Vance",
    age: 68,
    gender: "Male",
    mrn: "MRN-2026-8809",
    admitDate: "2026-09-07",
    primaryCondition: "Severe Bacterial Pneumonia",
    severity: "Critical",
    textData: {
      chiefComplaint: "High fever, productive rust-colored sputum cough, severe right chest pain.",
      clinicalNotes: "68-year-old male presenting with acute onset high fever (39.1°C), productive cough with rust-colored purulent sputum, right-sided pleuritic chest pain exacerbating on deep inspiration, and progressive dyspnea for 4 days. Auscultation demonstrates bronchial breath sounds and coarse crackles over the right lower lung zone.",
      extractedEntities: [
        { text: "Acute High Fever (39.1°C)", category: "Symptom", severity: "high" },
        { text: "Productive Sputum (Rust-colored)", category: "Clinical Sign", severity: "high" },
        { text: "Pleuritic Chest Pain", category: "Symptom", severity: "medium" },
        { text: "R lower zone crackles", category: "Physical Exam", severity: "high" },
        { text: "Progressive Dyspnea", category: "Symptom", severity: "high" }
      ]
    },
    labData: {
      vitals: {
        spo2: 89, // % (Normal 95-100)
        temp: 39.1, // °C (Normal 36.5-37.5)
        respRate: 28, // /min (Normal 12-20)
        heartRate: 112, // bpm (Normal 60-100)
        bloodPressure: "138/88"
      },
      bloodPanel: {
        wbc: 16.8, // 10^3/uL (Normal 4.5-11.0)
        crp: 142.5, // mg/L (Normal <5)
        procalcitonin: 2.8, // ng/mL (Normal <0.15)
        paO2FiO2: 240, // mmHg (Normal >300)
        fev1Fvc: 78 // % (Normal >70)
      }
    },
    xrayData: {
      imageType: "Pneumonia",
      description: "Dense consolidation in the right lower lobe with air bronchograms and localized pleural effusion.",
      findingTags: ["RLL Consolidation", "Air Bronchograms", "Right Costophrenic Blunting"],
      heatmapCoords: { x: 62, y: 65, radius: 24 } // % offset for Grad-CAM overlay
    },
    fusionResults: {
      modalityContributions: [
        { name: "Chest X-Ray Vision", weight: 46, color: "#3b82f6" },
        { name: "Clinical NLP Text", weight: 31, color: "#8b5cf6" },
        { name: "Lab & Vitals Biomarkers", weight: 23, color: "#06b6d4" }
      ],
      diseasePredictions: [
        { name: "Bacterial Pneumonia", probability: 94.2, status: "Critical Risk" },
        { name: "Pleural Effusion", probability: 48.6, status: "Moderate Risk" },
        { name: "Atelectasis", probability: 31.4, status: "Low Risk" },
        { name: "COPD / Emphysema", probability: 11.2, status: "Unlikely" },
        { name: "Pulmonary Tuberculosis", probability: 6.8, status: "Unlikely" },
        { name: "Pneumothorax", probability: 2.1, status: "Unlikely" }
      ],
      xaiDrivers: [
        { modality: "Vision", detail: "Dense opacification and air bronchograms in right lower lung field." },
        { modality: "Lab", detail: "Markedly elevated CRP (142.5 mg/L) and Leukocytosis (WBC 16.8)." },
        { modality: "Text", detail: "Extracted keywords: 'rust-colored sputum', 'bronchial breath sounds'." }
      ]
    }
  },
  {
    id: "PAT-3411",
    name: "Arthur Pendelton",
    age: 62,
    gender: "Male",
    mrn: "MRN-2026-3411",
    admitDate: "2026-09-06",
    primaryCondition: "COPD Exacerbation",
    severity: "High",
    textData: {
      chiefComplaint: "Worsening shortness of breath, chronic smoker cough, expiratory wheezing.",
      clinicalNotes: "62-year-old male with 45 pack-year smoking history presents with a 3-day exacerbation of dyspnea, increased clear sputum production, and bilateral expiratory wheezing. Reports morning coughing spells and severe limitation in walking distance.",
      extractedEntities: [
        { text: "45 Pack-Year Tobacco Use", category: "History", severity: "high" },
        { text: "Expiratory Wheezing", category: "Physical Exam", severity: "medium" },
        { text: "Chronic Productive Cough", category: "Symptom", severity: "medium" },
        { text: "Severe Dyspnea on Exertion", category: "Symptom", severity: "high" }
      ]
    },
    labData: {
      vitals: {
        spo2: 88,
        temp: 37.1,
        respRate: 26,
        heartRate: 98,
        bloodPressure: "142/90"
      },
      bloodPanel: {
        wbc: 9.4,
        crp: 14.8,
        procalcitonin: 0.12,
        paO2FiO2: 265,
        fev1Fvc: 51 // Severe airflow obstruction
      }
    },
    xrayData: {
      imageType: "COPD",
      description: "Bilateral pulmonary hyperinflation, flattened diaphragms, expanded retrosternal airspace, and sparse vascular markings.",
      findingTags: ["Bilateral Hyperinflation", "Diaphragmatic Flattening", "Retrosternal Airspace Expansion"],
      heatmapCoords: { x: 50, y: 40, radius: 35 }
    },
    fusionResults: {
      modalityContributions: [
        { name: "Lab & Vitals Biomarkers", weight: 44, color: "#06b6d4" },
        { name: "Clinical NLP Text", weight: 34, color: "#8b5cf6" },
        { name: "Chest X-Ray Vision", weight: 22, color: "#3b82f6" }
      ],
      diseasePredictions: [
        { name: "COPD / Emphysema", probability: 91.8, status: "High Risk" },
        { name: "Pneumonia", probability: 18.4, status: "Low Risk" },
        { name: "Atelectasis", probability: 14.2, status: "Low Risk" },
        { name: "Pneumothorax", probability: 8.5, status: "Unlikely" },
        { name: "Pulmonary Tuberculosis", probability: 3.1, status: "Unlikely" },
        { name: "Normal", probability: 1.5, status: "Unlikely" }
      ],
      xaiDrivers: [
        { modality: "Lab", detail: "FEV1/FVC ratio reduced to 51% (Severe airflow limitation)." },
        { modality: "Text", detail: "Heavy smoking history (45 pack-years) + chronic wheezing." },
        { modality: "Vision", detail: "Bilateral lung hyperinflation and diaphragm flattening." }
      ]
    }
  },
  {
    id: "PAT-5120",
    name: "Amara Diallo",
    age: 34,
    gender: "Female",
    mrn: "MRN-2026-5120",
    admitDate: "2026-09-05",
    primaryCondition: "Pulmonary Tuberculosis Suspect",
    severity: "High",
    textData: {
      chiefComplaint: "Persistent 3-week cough, night sweats, 6kg unintentional weight loss, hemoptysis.",
      clinicalNotes: "34-year-old female presenting with 3 weeks of low-grade evening fevers, drenching night sweats, fatigue, unintentional weight loss of 6kg, and persistent cough producing blood-streaked sputum. Patient moved from endemic region 6 months ago.",
      extractedEntities: [
        { text: "Hemoptysis (Blood in sputum)", category: "Clinical Sign", severity: "high" },
        { text: "Drenching Night Sweats", category: "Symptom", severity: "high" },
        { text: "Unintentional Weight Loss (6kg)", category: "Symptom", severity: "medium" },
        { text: "Subacute Cough (>3 weeks)", category: "Symptom", severity: "medium" }
      ]
    },
    labData: {
      vitals: {
        spo2: 96,
        temp: 38.2,
        respRate: 20,
        heartRate: 92,
        bloodPressure: "114/74"
      },
      bloodPanel: {
        wbc: 11.2,
        crp: 68.4,
        procalcitonin: 0.35,
        paO2FiO2: 340,
        fev1Fvc: 82
      }
    },
    xrayData: {
      imageType: "Tuberculosis",
      description: "Apical cavitary lesion in upper right lung zone with surrounding nodular infiltrates and ipsilateral hilar adenopathy.",
      findingTags: ["Apical Cavitary Lesion", "R Upper Lobe Infiltrates", "Hilar Adenopathy"],
      heatmapCoords: { x: 65, y: 28, radius: 18 }
    },
    fusionResults: {
      modalityContributions: [
        { name: "Chest X-Ray Vision", weight: 52, color: "#3b82f6" },
        { name: "Clinical NLP Text", weight: 33, color: "#8b5cf6" },
        { name: "Lab & Vitals Biomarkers", weight: 15, color: "#06b6d4" }
      ],
      diseasePredictions: [
        { name: "Pulmonary Tuberculosis", probability: 89.6, status: "High Risk" },
        { name: "Pneumonia", probability: 36.2, status: "Moderate Risk" },
        { name: "Lung Nodule / Cavity", probability: 64.5, status: "High Risk" },
        { name: "COPD", probability: 4.1, status: "Unlikely" },
        { name: "Pneumothorax", probability: 2.9, status: "Unlikely" },
        { name: "Normal", probability: 0.8, status: "Unlikely" }
      ],
      xaiDrivers: [
        { modality: "Vision", detail: "Upper lobe apical cavitation characteristic of active TB." },
        { modality: "Text", detail: "Constellation of hemoptysis, drenching night sweats, weight loss." },
        { modality: "Lab", detail: "Elevated CRP (68.4 mg/L) with moderate inflammatory markers." }
      ]
    }
  },
  {
    id: "PAT-1194",
    name: "Lucas Thorne",
    age: 27,
    gender: "Male",
    mrn: "MRN-2026-1194",
    admitDate: "2026-09-08",
    primaryCondition: "Left Tension Pneumothorax",
    severity: "Emergency",
    textData: {
      chiefComplaint: "Sudden onset violent left chest pain, acute respiratory collapse following blunt impact.",
      clinicalNotes: "27-year-old male admitted to Emergency Department following minor athletic trauma. Developed sudden severe sharp left chest pain and extreme shortness of breath. On exam: absent breath sounds over entire left hemithorax, hyperresonance on percussion, and slight tracheal shift to the right.",
      extractedEntities: [
        { text: "Absent L Breath Sounds", category: "Physical Exam", severity: "high" },
        { text: "Tracheal Deviation to Right", category: "Physical Exam", severity: "high" },
        { text: "Sudden Severe Pleuritic Pain", category: "Symptom", severity: "high" },
        { text: "Acute Hypoxemic Distress", category: "Symptom", severity: "high" }
      ]
    },
    labData: {
      vitals: {
        spo2: 83, // Critical hypoxemia
        temp: 36.8,
        respRate: 34, // Severe tachypnea
        heartRate: 132, // Severe tachycardia
        bloodPressure: "88/54" // Shock status
      },
      bloodPanel: {
        wbc: 10.1,
        crp: 8.2,
        procalcitonin: 0.05,
        paO2FiO2: 180, // Severe impairment
        fev1Fvc: 62
      }
    },
    xrayData: {
      imageType: "Pneumothorax",
      description: "Visible visceral pleural edge in upper-outer left hemithorax with complete loss of peripheral lung markings and contralateral mediastinal displacement.",
      findingTags: ["Left Pleural Edge Line", "Complete Vascular Absence", "Mediastinal Shift"],
      heatmapCoords: { x: 30, y: 35, radius: 30 }
    },
    fusionResults: {
      modalityContributions: [
        { name: "Chest X-Ray Vision", weight: 58, color: "#3b82f6" },
        { name: "Lab & Vitals Biomarkers", weight: 26, color: "#06b6d4" },
        { name: "Clinical NLP Text", weight: 16, color: "#8b5cf6" }
      ],
      diseasePredictions: [
        { name: "Pneumothorax", probability: 98.4, status: "Critical Emergency" },
        { name: "Atelectasis", probability: 42.1, status: "Moderate Risk" },
        { name: "Pneumonia", probability: 4.8, status: "Unlikely" },
        { name: "COPD", probability: 2.2, status: "Unlikely" },
        { name: "Tuberculosis", probability: 1.1, status: "Unlikely" },
        { name: "Normal", probability: 0.1, status: "Unlikely" }
      ],
      xaiDrivers: [
        { modality: "Vision", detail: "Sharp visceral pleural line and complete peripheral avascular zone." },
        { modality: "Lab", detail: "Profound hypoxemia (SpO2 83%) and hemodynamic instability." },
        { modality: "Text", detail: "Absent breath sounds & rightward tracheal deviation." }
      ]
    }
  },
  {
    id: "PAT-0042",
    name: "Clara Oswald",
    age: 45,
    gender: "Female",
    mrn: "MRN-2026-0042",
    admitDate: "2026-09-08",
    primaryCondition: "Normal Thoracic Scan (Healthy)",
    severity: "Normal",
    textData: {
      chiefComplaint: "Annual routine executive health evaluation. No respiratory complaints.",
      clinicalNotes: "45-year-old female presenting for routine preventive health checkup. Denies cough, shortness of breath, chest pain, fever, or night sweats. Non-smoker. Vesicular breath sounds heard clearly throughout all pulmonary fields bilaterally.",
      extractedEntities: [
        { text: "No Respiratory Symptoms", category: "Status", severity: "low" },
        { text: "Clear Bilateral Breath Sounds", category: "Physical Exam", severity: "low" },
        { text: "Non-Smoker Baseline", category: "History", severity: "low" }
      ]
    },
    labData: {
      vitals: {
        spo2: 99,
        temp: 36.6,
        respRate: 14,
        heartRate: 72,
        bloodPressure: "118/76"
      },
      bloodPanel: {
        wbc: 6.4,
        crp: 1.2,
        procalcitonin: 0.04,
        paO2FiO2: 450,
        fev1Fvc: 84
      }
    },
    xrayData: {
      imageType: "Normal",
      description: "Clear lung zones bilaterally. Cardiac size within normal limits. Sharp costophrenic angles and intact thoracic cage.",
      findingTags: ["Clear Lung Fields", "Normal Cardiac Size", "Intact Costophrenic Angles"],
      heatmapCoords: { x: 50, y: 50, radius: 10 }
    },
    fusionResults: {
      modalityContributions: [
        { name: "Chest X-Ray Vision", weight: 33.3, color: "#3b82f6" },
        { name: "Clinical NLP Text", weight: 33.3, color: "#8b5cf6" },
        { name: "Lab & Vitals Biomarkers", weight: 33.4, color: "#06b6d4" }
      ],
      diseasePredictions: [
        { name: "Normal Baseline", probability: 98.6, status: "Healthy Normal" },
        { name: "Pneumonia", probability: 1.1, status: "Unlikely" },
        { name: "COPD", probability: 0.7, status: "Unlikely" },
        { name: "Atelectasis", probability: 0.5, status: "Unlikely" },
        { name: "Pneumothorax", probability: 0.2, status: "Unlikely" },
        { name: "Tuberculosis", probability: 0.1, status: "Unlikely" }
      ],
      xaiDrivers: [
        { modality: "Vision", detail: "Homogenous opacity bilaterally with normal pulmonary vasculature." },
        { modality: "Lab", detail: "All vital and inflammatory biomarkers within optimal reference ranges." },
        { modality: "Text", detail: "Asymptomatic clinical history with clear pulmonary auscultation." }
      ]
    }
  }
];

export const SYSTEM_MODELS = {
  textModel: {
    name: "LogisticRegression Clinical Text Estimator (ML_models/text_model.joblib)",
    inputDim: 768,
    classes: 50,
    version: "text_model.joblib (768-D BioBERT Feature Vector -> 50 Target Classes)",
    task: "Clinical symptom extraction, 768-D representation vector, and text probability scoring"
  },
  labModel: {
    name: "TabTransformer-Health ML",
    inputDim: 128,
    version: "v2.1-vital",
    task: "Numerical biomarker standardization & anomaly encoding"
  },
  visionModel: {
    name: "DenseNet-121 + Swin-Transformer Vision",
    inputDim: 1024,
    version: "v4.0-cxr",
    task: "Chest X-ray spatial feature maps & Grad-CAM heatmap extraction"
  },
  fusionEngine: {
    name: "Cross-Attention Multimodal Transformer Fusion",
    latentDim: 512,
    version: "v5.2-unified",
    task: "Late feature fusion & multi-disease joint probability prediction"
  }
};

