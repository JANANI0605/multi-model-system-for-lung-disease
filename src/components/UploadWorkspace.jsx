import React, { useState } from 'react';
import { Upload, FileText, Activity, Image as ImageIcon, Sparkles, CheckCircle, FileSpreadsheet, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { parseUploadedLabReport, parseSymptomsText } from '../utils/labReportParser';

export default function UploadWorkspace({ onRunFusion, currentDataset }) {
  // Input states for the 3 uploaded modalities
  const [patientName, setPatientName] = useState('Patient-2026-X1');
  const [patientAge, setPatientAge] = useState(58);
  const [patientGender, setPatientGender] = useState('Male');

  // Modality 1: Symptoms Text
  const [symptomsText, setSymptomsText] = useState('');
  const [symptomsFileName, setSymptomsFileName] = useState('');

  // Modality 2: Original Lab Report
  const [labReportText, setLabReportText] = useState('');
  const [labFileName, setLabFileName] = useState('');

  // Modality 3: Chest X-Ray Image File
  const [xrayFile, setXrayFile] = useState(null);
  const [xrayPreview, setXrayPreview] = useState(null);
  const [xrayFileName, setXrayFileName] = useState('');

  const handleSymptomsFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSymptomsFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSymptomsText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleLabReportFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLabFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLabReportText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleXrayFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setXrayFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setXrayPreview(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const loadPresetSample = (type) => {
    if (type === 'Pneumonia') {
      setPatientName('Eleanor Vance');
      setPatientAge(68);
      setPatientGender('Male');
      setSymptomsText('Patient presents with 4 days of high fever (39.1°C), productive cough with rust-colored purulent sputum, right-sided pleuritic chest pain, and severe shortness of breath. Coarse crackles heard on right lower lung zone.');
      setSymptomsFileName('symptoms_patient_8092.txt');
      setLabReportText(`CLINICAL LABORATORY REPORT - METRO HEALTH
SpO2 Oxygen Saturation: 89% (Low)
Core Body Temp: 39.1 C (High Fever)
Respiratory Rate: 28 /min
WBC (Leukocytes): 16.8 k/uL (Elevated)
CRP (C-Reactive Protein): 142.5 mg/L (Markedly High)
FEV1/FVC Ratio: 78% (Normal)
Procalcitonin: 2.8 ng/mL`);
      setLabFileName('lab_report_complete_8092.pdf');
      setXrayFileName('chest_xray_pa_8092.png');
      setXrayPreview('/sample_pneumonia.png');
    } else if (type === 'COPD') {
      setPatientName('Arthur Pendelton');
      setPatientAge(62);
      setPatientGender('Male');
      setSymptomsText('62-year-old male with 45 pack-year tobacco smoking history presenting with acute onset shortness of breath, chronic morning cough, and bilateral expiratory wheezing.');
      setSymptomsFileName('symptoms_copd_patient.txt');
      setLabReportText(`LABORATORY SPIROMETRY & BLOOD GAS REPORT
SpO2 Oxygen Saturation: 88%
Core Body Temp: 37.1 C
Respiratory Rate: 26 /min
WBC: 9.4 k/uL
CRP: 14.8 mg/L
Spirometry FEV1/FVC Ratio: 51% (Severe Airflow Obstruction)`);
      setLabFileName('spirometry_lab_report.pdf');
      setXrayFileName('chest_xray_copd.png');
      setXrayPreview('/sample_copd.png');
    } else if (type === 'TB') {
      setPatientName('Amara Diallo');
      setPatientAge(34);
      setPatientGender('Female');
      setSymptomsText('34-year-old female with 3 weeks of low-grade evening fever, drenching night sweats, 6kg weight loss, and persistent cough producing blood-streaked sputum.');
      setSymptomsFileName('symptoms_tb_suspect.txt');
      setLabReportText(`INFLAMMATORY PANEL & LAB REPORT
SpO2: 96%
Temp: 38.2 C
WBC: 11.2 k/uL
CRP: 68.4 mg/L
FEV1/FVC Ratio: 82%`);
      setLabFileName('lab_report_tb.pdf');
      setXrayFileName('chest_xray_apical_cavity.png');
      setXrayPreview('/sample_tb.png');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptomsText && !labReportText && !xrayPreview) {
      alert('Please provide at least 1 modality file or input (Symptoms, Lab Report, or Chest X-Ray).');
      return;
    }

    const parsedLabs = parseUploadedLabReport(labReportText);
    const parsedSymptoms = parseSymptomsText(symptomsText);

    onRunFusion({
      patientName,
      patientAge,
      patientGender,
      symptomsText,
      symptomsFileName,
      parsedSymptoms,
      labReportText,
      labFileName,
      parsedLabs,
      xrayPreview,
      xrayFileName
    });
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Upload size={24} style={{ color: '#0284c7' }} />
            Dynamic Patient Data Intake & Multimodal Uploader
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Upload raw patient files for 3 healthcare modalities to run joint AI feature fusion and generate diagnostic reports.
          </p>
        </div>

        {/* Quick Sample Loaders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Quick Samples:</span>
          <button onClick={() => loadPresetSample('Pneumonia')} type="button" className="preset-pill-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
            <Zap size={12} style={{ color: '#0284c7' }} /> Pneumonia
          </button>
          <button onClick={() => loadPresetSample('COPD')} type="button" className="preset-pill-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
            <Zap size={12} style={{ color: '#0d9488' }} /> COPD
          </button>
          <button onClick={() => loadPresetSample('TB')} type="button" className="preset-pill-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
            <Zap size={12} style={{ color: '#d97706' }} /> TB
          </button>
        </div>
      </div>

      {/* Patient Demographics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Patient Name / ID</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. Eleanor Vance"
            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Age (Years)</label>
          <input
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Gender</label>
          <select
            value={patientGender}
            onChange={(e) => setPatientGender(e.target.value)}
            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* 3 Healthcare Modalities Upload Cards Grid */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        {/* CARD 1: SYMPTOMS TEXT UPLOAD */}
        <div style={{ background: '#f8fafc', border: '1px solid #bae6fd', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488', fontWeight: 700, fontSize: '0.92rem' }}>
              <FileText size={18} /> Modality 1: Symptoms Text
            </div>
            {symptomsFileName && (
              <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Uploaded
              </span>
            )}
          </div>

          <label style={{ border: '2px dashed #99f6e4', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', cursor: 'pointer', background: '#ffffff', fontSize: '0.75rem', color: '#475569' }}>
            <Upload size={16} style={{ color: '#0d9488', margin: '0 auto 4px auto' }} />
            {symptomsFileName ? symptomsFileName : 'Upload Symptoms Document (.txt, .pdf)'}
            <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleSymptomsFileUpload} style={{ display: 'none' }} />
          </label>

          <textarea
            value={symptomsText}
            onChange={(e) => setSymptomsText(e.target.value)}
            placeholder="OR paste patient symptoms, fever notes, cough details, dyspnea..."
            style={{ width: '100%', minHeight: '110px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', color: '#0f172a', fontSize: '0.82rem', resize: 'vertical' }}
          />
        </div>

        {/* CARD 2: ORIGINAL LAB REPORT FILE UPLOAD */}
        <div style={{ background: '#f8fafc', border: '1px solid #bae6fd', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 700, fontSize: '0.92rem' }}>
              <Activity size={18} /> Modality 2: Original Lab Report
            </div>
            {labFileName && (
              <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Uploaded
              </span>
            )}
          </div>

          <label style={{ border: '2px dashed #bae6fd', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', cursor: 'pointer', background: '#ffffff', fontSize: '0.75rem', color: '#475569' }}>
            <Upload size={16} style={{ color: '#0284c7', margin: '0 auto 4px auto' }} />
            {labFileName ? labFileName : 'Upload Original Lab Report (.pdf, .txt, .csv)'}
            <input type="file" accept=".pdf,.txt,.csv,.json" onChange={handleLabReportFileUpload} style={{ display: 'none' }} />
          </label>

          <textarea
            value={labReportText}
            onChange={(e) => setLabReportText(e.target.value)}
            placeholder="OR paste raw lab report document text (e.g. SpO2: 89%, WBC: 16.8, CRP: 142.5 mg/L)..."
            style={{ width: '100%', minHeight: '110px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', color: '#0f172a', fontSize: '0.82rem', resize: 'vertical' }}
          />
        </div>

        {/* CARD 3: CHEST X-RAY IMAGE FILE UPLOAD */}
        <div style={{ background: '#f8fafc', border: '1px solid #bae6fd', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 700, fontSize: '0.92rem' }}>
              <ImageIcon size={18} /> Modality 3: Chest X-Ray Image
            </div>
            {xrayFileName && (
              <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Uploaded
              </span>
            )}
          </div>

          <label style={{ border: '2px dashed #bae6fd', borderRadius: '8px', padding: '0.8rem', textAlign: 'center', cursor: 'pointer', background: '#ffffff', fontSize: '0.75rem', color: '#475569', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={20} style={{ color: '#0284c7', marginBottom: '4px' }} />
            <strong>{xrayFileName ? xrayFileName : 'Upload Chest X-Ray Image'}</strong>
            <span style={{ fontSize: '0.68rem' }}>(DICOM / PNG / JPG Radiograph)</span>
            <input type="file" accept="image/*" onChange={handleXrayFileUpload} style={{ display: 'none' }} />
          </label>

          {xrayPreview && (
            <div style={{ height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #0284c7' }}>
              <img src={xrayPreview} alt="Uploaded X-ray Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Action Button Span across all 3 columns */}
        <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <Sparkles size={20} /> Execute Multimodal AI Fusion
          </button>
        </div>

      </form>
    </div>
  );
}
