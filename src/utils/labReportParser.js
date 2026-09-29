// Intelligent Lab Report & Clinical Text Document Parser

export function parseUploadedLabReport(rawText) {
  const text = (rawText || '').toLowerCase();

  // Default baseline reference values if not specified in uploaded file
  let labMetrics = {
    spo2: null,
    temp: null,
    respRate: null,
    wbc: null,
    crp: null,
    fev1Fvc: null,
    procalcitonin: null,
    hemoglobin: null,
    extractedRows: []
  };

  // 1. SpO2 Oxygen Saturation regex
  const spo2Match = text.match(/(spo2|oxygen saturation|o2 sat|o2 saturation)[\s:=]*(\d{2,3})\s*%/i) ||
                    text.match(/(\d{2,3})\s*%\s*(spo2|o2 sat)/i);
  if (spo2Match) {
    labMetrics.spo2 = parseFloat(spo2Match[2] || spo2Match[1]);
  }

  // 2. Temperature regex
  const tempMatch = text.match(/(temp|temperature|fever)[\s:=]*(\d{2,3}\.?\d?)\s*(°?c|celsius)?/i) ||
                    text.match(/(\d{2,3}\.?\d?)\s*°?c/i);
  if (tempMatch) {
    labMetrics.temp = parseFloat(tempMatch[2] || tempMatch[1]);
  }

  // 3. WBC White Blood Cell count regex
  const wbcMatch = text.match(/(wbc|white blood cell|leukocyte|leukocytes)[\s:=]*(\d{1,2}\.?\d?)/i) ||
                   text.match(/wbc\s*(\d{1,2}\.?\d?)/i);
  if (wbcMatch) {
    labMetrics.wbc = parseFloat(wbcMatch[2] || wbcMatch[1]);
  }

  // 4. CRP C-Reactive Protein regex
  const crpMatch = text.match(/(crp|c-reactive protein|c reactive protein)[\s:=]*(\d{1,3}\.?\d?)/i) ||
                   text.match(/crp\s*(\d{1,3}\.?\d?)/i);
  if (crpMatch) {
    labMetrics.crp = parseFloat(crpMatch[2] || crpMatch[1]);
  }

  // 5. FEV1/FVC ratio regex
  const fev1Match = text.match(/(fev1\/fvc|fev1|spirometry)[\s:=]*(\d{2,3})\s*%/i) ||
                    text.match(/fev1\s*(\d{2,3})/i);
  if (fev1Match) {
    labMetrics.fev1Fvc = parseFloat(fev1Match[2] || fev1Match[1]);
  }

  // 6. Procalcitonin regex
  const pctMatch = text.match(/(procalcitonin|pct)[\s:=]*(\d{1,2}\.?\d?)/i);
  if (pctMatch) {
    labMetrics.procalcitonin = parseFloat(pctMatch[2]);
  }

  // Build extracted structured rows for display
  const rows = [];
  if (labMetrics.spo2 !== null) rows.push({ name: 'SpO2 Oxygen Saturation', value: `${labMetrics.spo2}%`, ref: '95 - 100%', status: labMetrics.spo2 < 94 ? 'Abnormal (Low)' : 'Normal' });
  if (labMetrics.temp !== null) rows.push({ name: 'Body Temperature', value: `${labMetrics.temp} °C`, ref: '36.5 - 37.5 °C', status: labMetrics.temp > 37.8 ? 'Abnormal (Fever)' : 'Normal' });
  if (labMetrics.wbc !== null) rows.push({ name: 'WBC (Leukocytes)', value: `${labMetrics.wbc} k/µL`, ref: '4.5 - 11.0 k/µL', status: labMetrics.wbc > 11.0 ? 'Abnormal (High)' : 'Normal' });
  if (labMetrics.crp !== null) rows.push({ name: 'C-Reactive Protein (CRP)', value: `${labMetrics.crp} mg/L`, ref: '< 5.0 mg/L', status: labMetrics.crp > 5.0 ? 'Abnormal (High)' : 'Normal' });
  if (labMetrics.fev1Fvc !== null) rows.push({ name: 'FEV1/FVC Ratio', value: `${labMetrics.fev1Fvc}%`, ref: '> 70%', status: labMetrics.fev1Fvc < 70 ? 'Abnormal (Obstruction)' : 'Normal' });

  labMetrics.extractedRows = rows;
  return labMetrics;
}

// Symptom Extractor from raw uploaded symptom text
export function parseSymptomsText(rawText) {
  const text = (rawText || '').toLowerCase();
  const symptoms = [];

  if (text.includes('fever') || text.includes('temperature') || text.includes('chills')) {
    symptoms.push({ name: 'Fever / Pyrexia', category: 'Systemic', severity: 'high' });
  }
  if (text.includes('cough') || text.includes('sputum') || text.includes('phlegm')) {
    symptoms.push({ name: 'Productive Cough', category: 'Respiratory', severity: 'high' });
  }
  if (text.includes('shortness of breath') || text.includes('dyspnea') || text.includes('breathless')) {
    symptoms.push({ name: 'Dyspnea / Breathlessness', category: 'Respiratory', severity: 'high' });
  }
  if (text.includes('chest pain') || text.includes('pleuritic')) {
    symptoms.push({ name: 'Pleuritic Chest Pain', category: 'Thoracic', severity: 'medium' });
  }
  if (text.includes('sweat') || text.includes('night sweats')) {
    symptoms.push({ name: 'Drenching Night Sweats', category: 'Systemic', severity: 'high' });
  }
  if (text.includes('blood') || text.includes('hemoptysis')) {
    symptoms.push({ name: 'Hemoptysis (Blood in sputum)', category: 'Respiratory', severity: 'high' });
  }
  if (text.includes('smoke') || text.includes('smoking') || text.includes('tobacco')) {
    symptoms.push({ name: 'Tobacco Use History', category: 'Risk Factor', severity: 'high' });
  }
  if (text.includes('wheez') || text.includes('rhonchi') || text.includes('crackles')) {
    symptoms.push({ name: 'Auscultation Crackles / Wheezing', category: 'Physical Exam', severity: 'medium' });
  }

  if (symptoms.length === 0 && text.trim().length > 0) {
    symptoms.push({ name: 'Custom Clinical Symptoms Notes Recorded', category: 'Observation', severity: 'low' });
  }

  return symptoms;
}
