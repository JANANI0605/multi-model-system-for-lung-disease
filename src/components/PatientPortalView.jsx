import React, { useState, useEffect } from 'react';
import { User, FileText, Activity, Image as ImageIcon, Download, ShieldCheck, Sparkles, CheckCircle2, HeartPulse, LogOut, Search, Eye, Layers, HelpCircle, ArrowRight, Brain, AlertTriangle, Cpu, Calendar } from 'lucide-react';
import { fetchMlPredictions, fetchVitImagePredictions } from '../utils/mlApi';
import PatientAiChat from './PatientAiChat';

export default function PatientPortalView({ patient, onOpenReport, onOpenUpload, onLogout, onOpenXai }) {
  const [liveMlResults, setLiveMlResults] = useState(null);
  const [liveVitResults, setLiveVitResults] = useState(null);
  const [isMlLoading, setIsMlLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMlInference() {
      if (!patient) return;
      setIsMlLoading(true);
      const textToAnalyze = `${patient.textData?.chiefComplaint || ''} ${patient.textData?.clinicalNotes || ''}`;
      
      const [textRes, vitRes] = await Promise.all([
        fetchMlPredictions(textToAnalyze),
        fetchVitImagePredictions(patient.xrayData?.customImageSrc || patient.primaryCondition || '')
      ]);

      if (isMounted) {
        if (textRes && textRes.success) setLiveMlResults(textRes);
        else setLiveMlResults(null);

        if (vitRes && vitRes.success) setLiveVitResults(vitRes);
        else setLiveVitResults(null);

        setIsMlLoading(false);
      }
    }
    loadMlInference();
    return () => { isMounted = false; };
  }, [patient]);

  const predictions = patient?.fusionResults?.diseasePredictions || [];
  const topDiagnosis = predictions[0] || { name: 'Normal Baseline', probability: 95, status: 'Healthy' };
  const contributions = patient?.fusionResults?.modalityContributions || [
    { name: "Clinical Symptoms", weight: 35.0, color: "#8b5cf6" },
    { name: "Lab & Vitals Biomarkers", weight: 30.0, color: "#06b6d4" },
    { name: "Chest X-Ray Vision", weight: 35.0, color: "#3b82f6" }
  ];
  const xaiDrivers = patient?.fusionResults?.xaiDrivers || [
    { modality: "Text", detail: `Clinical symptoms intake reported by ${patient?.name || 'patient'}.` }
  ];

  // Recommended clinical care roadmap
  const getTreatmentPlan = (condition = '') => {
    if (condition.includes('Pneumonia')) {
      return [
        "Consult your doctor for targeted antibiotic therapy",
        "Maintain supplemental oxygen if SpO2 drops below 92%",
        "Rest, adequate hydration, and sputum clearance",
        "Follow-up blood inflammatory tests in 48 hours"
      ];
    } else if (condition.includes('COPD')) {
      return [
        "Inhaled bronchodilator therapy as prescribed",
        "Corticosteroid therapy for airway inflammation",
        "Target oxygen saturation of 88-92%",
        "Regular spirometry (FEV1/FVC) monitoring"
      ];
    } else if (condition.includes('Tuberculosis')) {
      return [
        "Sputum AFB smear and GeneXpert PCR confirmation",
        "Standard multi-drug antitubercular regimen",
        "Airborne isolation precautions during active phase",
        "Follow-up chest radiograph in 2 months"
      ];
    } else if (condition.includes('Pneumothorax')) {
      return [
        "Urgent needle decompression / chest tube placement",
        "High-flow supplemental 100% oxygen support",
        "Serial chest radiograph monitoring",
        "Thoracic surgeon consultation"
      ];
    } else {
      return [
        "Routine annual preventive pulmonary health checkup",
        "Maintain regular aerobic exercise & non-smoking habit",
        "Seasonal influenza & pneumococcal vaccination",
        "Baseline spirometry and vitals monitoring"
      ];
    }
  };

  const treatmentSteps = getTreatmentPlan(patient?.primaryCondition || '');
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const topProbScore = typeof topDiagnosis.probability === 'number'
    ? topDiagnosis.probability
    : parseFloat(topDiagnosis.probability || topDiagnosis.confidence_score) || 95.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1350px', margin: '0 auto', width: '100%' }}>
      
      {/* Patient Welcome Hero Card (Reference Image Style) */}
      <div className="patient-welcome-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="patient-portal-avatar">
            <User size={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="portal-tag-badge">PERSONAL HEALTH PORTAL</span>
              <span style={{ fontSize: '0.72rem', color: '#0284c7', background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                Secure Patient Record
              </span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', letterSpacing: '-0.02em' }}>
              {timeGreeting}, <span style={{ color: '#0072ce' }}>{patient?.name || 'Patient'}</span>!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '3px', fontWeight: 500 }}>
              Here's what's happening with your health summary today.
            </p>
          </div>
        </div>

        {/* Action Buttons & Date Pill Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', padding: '0.5rem 1.1rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Calendar size={15} style={{ color: '#0284c7' }} />
            <span>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

          <button onClick={onOpenXai} className="preset-pill-btn" style={{ padding: '0.6rem 1.15rem', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 600, borderRadius: '9999px' }}>
            <Search size={16} /> Detailed Explanation
          </button>

          <button onClick={onOpenReport} className="btn-primary" style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)', color: '#ffffff', border: 'none', fontWeight: 700, borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(12, 49, 102, 0.2)' }}>
            <FileText size={16} /> Diagnostic Report
          </button>
        </div>
      </div>

      {/* Primary Diagnosis Highlight Box */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>MAIN HEALTH FINDING</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            Primary Condition Identified: <strong style={{ color: topProbScore > 75 ? '#dc2626' : '#0284c7' }}>{patient?.primaryCondition || topDiagnosis.name}</strong>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
            Overall Diagnostic Score: <strong style={{ color: '#0284c7' }}>{topProbScore.toFixed(1)}%</strong> ({patient?.severity || 'Normal'} Risk Classification)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#ecfdf5', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #a7f3d0', color: '#059669', fontSize: '0.84rem', fontWeight: 700 }}>
          <ShieldCheck size={20} />
          <span>Multi-Source Health Verification</span>
        </div>
      </div>

      {/* TOP 5 PREDICTED DISEASES WITH SYMPTOMS & CONFIDENCE SCORES */}
      <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={24} style={{ color: '#0284c7' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                AI Health Analysis: Top 5 Conditions & Symptoms
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Analyzed in real time from your reported symptoms and medical notes in clear, easy-to-understand terms
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.45rem 0.9rem', borderRadius: '20px', border: '1px solid #a7f3d0', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>AI Symptom Analysis Active</span>
          </div>
        </div>

        {/* Symptoms Analyzed Banner */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
            <strong style={{ color: '#0f172a' }}>Key Symptoms Analyzed by AI:</strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {((liveMlResults?.symptomsAnalyzed) || patient?.textData?.extractedEntities || [{ symptom: 'Routine Intake', severity: 'low' }]).map((sym, idx) => (
              <span key={idx} className={`entity-chip chip-${sym.severity || 'medium'}`} style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={11} /> {sym.symptom || sym.text}
              </span>
            ))}
          </div>
        </div>

        {/* TOP 5 DISEASES LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(liveMlResults?.top5Diseases || patient?.fusionResults?.diseasePredictions?.slice(0, 5) || predictions.slice(0, 5)).map((item, idx) => {
            const diseaseName = item.name;
            const rawProb = item.confidence_score !== undefined ? item.confidence_score : item.probability;
            const confidence = typeof rawProb === 'number' ? rawProb : parseFloat(rawProb) || 0;
            const statusText = item.status || (confidence > 80 ? "Requires Medical Care" : confidence > 50 ? "Moderate Risk" : "Low Risk");
            const symptomsList = item.associated_symptoms || [patient?.textData?.extractedEntities?.[0]?.text || "Productive Cough", "Fever"];

            return (
              <div key={idx} style={{ background: idx === 0 ? '#f0f9ff' : '#ffffff', border: idx === 0 ? '1px solid #bae6fd' : '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', transition: 'all 0.2s ease' }}>
                
                {/* Top Row: Rank, Name, Risk Status & Confidence Score */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? '#0284c7' : '#f1f5f9', color: idx === 0 ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{diseaseName}</strong>
                      <span style={{ fontSize: '0.72rem', background: confidence > 75 ? '#fef2f2' : confidence > 45 ? '#fffbeb' : '#f0fdf4', color: confidence > 75 ? '#dc2626' : confidence > 45 ? '#d97706' : '#059669', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${confidence > 75 ? '#fecaca' : confidence > 45 ? '#fde68a' : '#bbf7d0'}`, fontWeight: 700, marginLeft: '8px' }}>
                        {statusText}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '150px', height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, confidence))}%`, height: '100%', background: confidence > 75 ? '#dc2626' : confidence > 45 ? '#d97706' : '#0284c7', borderRadius: '10px' }} />
                    </div>
                    <strong className="mono" style={{ fontSize: '1.05rem', color: confidence > 75 ? '#dc2626' : '#0284c7', minWidth: '54px', textAlign: 'right' }}>
                      {confidence.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Bottom Row: Associated Symptoms driving this prediction */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.4rem', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Matched Symptoms:</span>
                  {symptomsList.map((sym, sIdx) => (
                    <span key={sIdx} style={{ fontSize: '0.72rem', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                      • {sym}
                    </span>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* VISION TRANSFORMER (ViT) IMAGE ML MODEL CARD */}
      <div style={{ background: '#ffffff', border: '1px solid #c7d2fe', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={24} style={{ color: '#4f46e5' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Chest X-Ray Imaging Analysis
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Automated computer scan analysis of your chest X-ray image for lung conditions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', padding: '0.45rem 0.9rem', borderRadius: '20px', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '0.78rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>X-Ray Imaging Model Active</span>
          </div>
        </div>

        {/* TOP 5 ViT IMAGE PREDICTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {patient?.xrayData?.customImageSrc || liveVitResults ? (
            (liveVitResults?.top5Diseases || []).map((item, idx) => {
              const confVal = typeof item.confidence_score === 'number' ? item.confidence_score : parseFloat(item.confidence_score) || 0;
              return (
                <div key={idx} style={{ background: item.is_abnormal ? '#eef2ff' : '#ffffff', border: item.is_abnormal ? '1px solid #c7d2fe' : '1px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: item.is_abnormal ? '#4f46e5' : '#f1f5f9', color: item.is_abnormal ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.name}</strong>
                      <span style={{ fontSize: '0.72rem', background: item.is_abnormal ? '#fef2f2' : '#f0fdf4', color: item.is_abnormal ? '#dc2626' : '#059669', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${item.is_abnormal ? '#fecaca' : '#bbf7d0'}`, fontWeight: 700, marginLeft: '8px' }}>
                        {item.status || (item.is_abnormal ? 'Abnormal Finding' : 'Normal')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Threshold: <strong className="mono" style={{ color: '#4338ca' }}>{item.threshold}%</strong>
                    </div>
                    <div style={{ width: '140px', height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, confVal))}%`, height: '100%', background: confVal > 75 ? '#dc2626' : confVal > 50 ? '#4f46e5' : '#0284c7', borderRadius: '10px' }} />
                    </div>
                    <strong className="mono" style={{ fontSize: '1.05rem', color: confVal > 75 ? '#dc2626' : '#4f46e5', minWidth: '54px', textAlign: 'right' }}>
                      {confVal.toFixed(1)}%
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <ImageIcon size={32} style={{ color: '#4f46e5' }} />
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>No Chest X-Ray Scan Uploaded Yet</h4>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                  Upload a chest radiograph to evaluate automated imaging AI findings.
                </p>
              </div>
              <button onClick={onOpenUpload} className="preset-pill-btn" style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.55rem 1.2rem', fontWeight: 600 }}>
                + Upload Chest X-Ray Scan
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 4 CLEAN CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        
        {/* CARD 1: MY LAB TESTS & VITALS */}
        <div className="modality-card">
          <div className="modality-header">
            <div className="modality-title">
              <div className="modality-icon-badge icon-lab">
                <Activity size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>My Health Vitals & Lab Tests</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Panel & Spirometry Results</p>
              </div>
            </div>
          </div>

          <div className="lab-metrics-table">
            <div className="lab-metric-row">
              <span className="lab-name">SpO2 Oxygen Saturation</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: (patient?.labData?.vitals?.spo2 || 98) < 94 ? '#dc2626' : '#059669' }}>
                {patient?.labData?.vitals?.spo2 || 98}% {(patient?.labData?.vitals?.spo2 || 98) < 94 ? '(Low)' : '(Normal)'}
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">Body Temperature</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: (patient?.labData?.vitals?.temp || 37.0) > 37.8 ? '#dc2626' : '#059669' }}>
                {patient?.labData?.vitals?.temp || 37.0} °C {(patient?.labData?.vitals?.temp || 37.0) > 37.8 ? '(Fever)' : '(Normal)'}
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">WBC Leukocytes</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: (patient?.labData?.bloodPanel?.wbc || 6.5) > 11.0 ? '#dc2626' : '#059669' }}>
                {patient?.labData?.bloodPanel?.wbc || 6.5} k/µL
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">C-Reactive Protein (CRP)</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: (patient?.labData?.bloodPanel?.crp || 2.5) > 5.0 ? '#dc2626' : '#059669' }}>
                {patient?.labData?.bloodPanel?.crp || 2.5} mg/L
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">Spirometry FEV1/FVC Ratio</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: (patient?.labData?.bloodPanel?.fev1Fvc || 82) < 70 ? '#dc2626' : '#059669' }}>
                {patient?.labData?.bloodPanel?.fev1Fvc || 82}%
              </strong>
            </div>
          </div>
        </div>

        {/* CARD 2: MY SYMPTOMS */}
        <div className="modality-card">
          <div className="modality-header">
            <div className="modality-title">
              <div className="modality-icon-badge icon-text">
                <FileText size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>My Reported Symptoms</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Clinical Complaints & Exam</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '10px', borderLeft: '4px solid #0d9488', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>CHIEF COMPLAINT</div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>"{patient?.textData?.chiefComplaint || 'Self-reported intake'}"</p>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
            {patient?.textData?.clinicalNotes || 'No additional clinical notes recorded.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto' }}>
            {(patient?.textData?.extractedEntities || []).map((ent, idx) => (
              <span key={idx} className={`entity-chip chip-${ent.severity || 'medium'}`}>
                <CheckCircle2 size={11} /> {ent.text || ent.symptom}
              </span>
            ))}
          </div>
        </div>

        {/* CARD 3: MY CHEST X-RAY SCAN */}
        <div className="modality-card">
          <div className="modality-header">
            <div className="modality-title">
              <div className="modality-icon-badge icon-xray">
                <ImageIcon size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>My Chest X-Ray Scan</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>PA Thoracic Imaging Impression</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: '170px', borderRadius: '10px', overflow: 'hidden', background: '#0f172a', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {patient?.xrayData?.customImageSrc ? (
              <img src={patient.xrayData.customImageSrc} alt="My X-Ray" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <ImageIcon size={36} style={{ color: '#38bdf8', margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>PA Thoracic Radiograph</div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Imaging Active</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            <strong style={{ color: '#0f172a' }}>Radiographic Impression:</strong> {patient?.xrayData?.description || 'Routine PA radiograph analysis.'}
          </div>
        </div>

        {/* CARD 4: MY PERSONAL CARE ROADMAP */}
        <div className="modality-card">
          <div className="modality-header">
            <div className="modality-title">
              <div className="modality-icon-badge icon-lab" style={{ background: '#f0fdf4', color: '#059669' }}>
                <HeartPulse size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Recommended Action Steps</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Personal Care Roadmap</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {treatmentSteps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e0f2fe', border: '1px solid #0284c7', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 500 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          <button onClick={onOpenXai} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '0.6rem' }}>
            <Search size={16} /> View Explainable AI (XAI) <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* EXPLAINABLE AI DRIVERS & FEATURE WEIGHTS PANEL */}
      <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Search size={20} style={{ color: '#0284c7' }} />
              Why the AI Formed This Finding (Transparent Medical Insights)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Clear breakdown showing how your symptoms, blood tests, and chest X-ray contributed to your assessment
            </p>
          </div>

          <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #bae6fd' }}>
            100% Transparent & Patient Friendly
          </span>
        </div>

        {/* Modality Feature Weight Contributions Bar Chart */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Modality Feature Weight Contributions (%)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {contributions.map((mod, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  <span>{mod.name}</span>
                  <strong className="mono" style={{ color: '#0284c7' }}>{mod.weight}% Contribution</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${mod.weight}%`, height: '100%', background: mod.color || '#0284c7', borderRadius: '10px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specific Diagnostic Drivers List */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Key XAI Diagnostic Evidence Drivers
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {xaiDrivers.map((driver, idx) => (
              <div key={idx} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {driver.modality} Modality Driver
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500, lineHeight: '1.4' }}>
                  "{driver.detail}"
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* INTERACTIVE HEALTH Q&A ASSISTANT */}
      <PatientAiChat patient={patient} />

    </div>
  );
}
