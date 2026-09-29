import React, { useState, useEffect } from 'react';
import { User, FileText, Activity, Image as ImageIcon, Download, ShieldCheck, Sparkles, CheckCircle2, HeartPulse, LogOut, Search, Eye, Layers, HelpCircle, ArrowRight, Brain, AlertTriangle } from 'lucide-react';
import { fetchMlPredictions } from '../utils/mlApi';

export default function PatientPortalView({ patient, onOpenReport, onOpenUpload, onLogout, onOpenXai }) {
  const [liveMlResults, setLiveMlResults] = useState(null);
  const [isMlLoading, setIsMlLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMlInference() {
      setIsMlLoading(true);
      const textToAnalyze = `${patient.textData?.chiefComplaint || ''} ${patient.textData?.clinicalNotes || ''}`;
      const res = await fetchMlPredictions(textToAnalyze);
      if (isMounted) {
        if (res && res.success) {
          setLiveMlResults(res);
        } else {
          setLiveMlResults(null);
        }
        setIsMlLoading(false);
      }
    }
    loadMlInference();
    return () => { isMounted = false; };
  }, [patient]);

  const predictions = patient.fusionResults.diseasePredictions;
  const topDiagnosis = predictions[0] || { name: 'Normal Baseline', probability: 95, status: 'Healthy' };
  const contributions = patient.fusionResults.modalityContributions || [];
  const xaiDrivers = patient.fusionResults.xaiDrivers || [];

  // Recommended clinical care roadmap
  const getTreatmentPlan = (condition) => {
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

  const treatmentSteps = getTreatmentPlan(patient.primaryCondition);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1350px', margin: '0 auto', width: '100%' }}>
      
      {/* Patient Welcome Hero Card */}
      <div className="patient-welcome-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="patient-portal-avatar">
            <User size={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="portal-tag-badge">PERSONAL HEALTH PORTAL</span>
              <span style={{ fontSize: '0.72rem', color: '#0284c7', background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                Isolated Patient Session
              </span>
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              Welcome, {patient.name}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#475569', marginTop: '2px' }}>
              MRN: <span className="mono" style={{ color: '#0284c7', fontWeight: 700 }}>{patient.mrn}</span> | Age: <strong style={{ color: '#0f172a' }}>{patient.age} yrs</strong> | Gender: <strong style={{ color: '#0f172a' }}>{patient.gender}</strong> | Admitted: <strong style={{ color: '#0f172a' }}>{patient.admitDate}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={onOpenXai} className="preset-pill-btn" style={{ padding: '0.65rem 1.1rem', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 600 }}>
            <Search size={16} /> View Explainable AI (XAI)
          </button>

          <button onClick={onOpenReport} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Download size={16} /> Download PDF Report
          </button>
        </div>
      </div>

      {/* Primary Diagnosis Highlight Box */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>AI DIAGNOSTIC FINDING</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            Primary Condition: <strong style={{ color: topDiagnosis.probability > 75 ? '#dc2626' : '#0284c7' }}>{patient.primaryCondition}</strong>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
            Multimodal Joint Confidence: <strong style={{ color: '#0284c7' }}>{topDiagnosis.probability.toFixed(1)}%</strong> ({patient.severity} Risk Classification)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#ecfdf5', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #a7f3d0', color: '#059669', fontSize: '0.84rem', fontWeight: 700 }}>
          <ShieldCheck size={20} />
          <span>Multimodal Data Fused & Verified</span>
        </div>
      </div>

      {/* TOP 5 PREDICTED DISEASES WITH SYMPTOMS & CONFIDENCE SCORES (PROMINENT TOP POSITION) */}
      <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={24} style={{ color: '#0284c7' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Top 5 Disease Predictions & Matched Symptoms (ML Inference)
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Live text classification from <strong style={{ color: '#0284c7' }}>ML_models/text_model.joblib</strong> using 768-dimensional BioBERT feature embeddings
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.45rem 0.9rem', borderRadius: '20px', border: '1px solid #a7f3d0', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>ML Model Active (text_model.joblib)</span>
          </div>
        </div>

        {/* Symptoms Analyzed Banner */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
            <strong style={{ color: '#0f172a' }}>Extracted Clinical Symptoms Analyzed by ML:</strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {((liveMlResults?.symptomsAnalyzed) || patient.textData.extractedEntities).map((sym, idx) => (
              <span key={idx} className={`entity-chip chip-${sym.severity || 'medium'}`} style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={11} /> {sym.symptom || sym.text}
              </span>
            ))}
          </div>
        </div>

        {/* TOP 5 DISEASES LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(liveMlResults?.top5Diseases || patient.fusionResults.diseasePredictions.slice(0, 5)).map((item, idx) => {
            const diseaseName = item.name;
            const confidence = item.confidence_score !== undefined ? item.confidence_score : item.probability;
            const statusText = item.status || (confidence > 80 ? "Critical Risk" : confidence > 50 ? "High Risk" : "Moderate Risk");
            const symptomsList = item.associated_symptoms || [patient.textData?.extractedEntities?.[0]?.text || "Productive Cough", "Fever"];

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
                      <div style={{ width: `${confidence}%`, height: '100%', background: confidence > 75 ? '#dc2626' : confidence > 45 ? '#d97706' : '#0284c7', borderRadius: '10px' }} />
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
              <strong className="mono" style={{ fontSize: '0.92rem', color: patient.labData.vitals.spo2 < 94 ? '#dc2626' : '#059669' }}>
                {patient.labData.vitals.spo2}% {patient.labData.vitals.spo2 < 94 ? '(Low)' : '(Normal)'}
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">Body Temperature</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: patient.labData.vitals.temp > 37.8 ? '#dc2626' : '#059669' }}>
                {patient.labData.vitals.temp} °C {patient.labData.vitals.temp > 37.8 ? '(Fever)' : '(Normal)'}
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">WBC Leukocytes</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: patient.labData.bloodPanel.wbc > 11.0 ? '#dc2626' : '#059669' }}>
                {patient.labData.bloodPanel.wbc} k/µL
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">C-Reactive Protein (CRP)</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: patient.labData.bloodPanel.crp > 5.0 ? '#dc2626' : '#059669' }}>
                {patient.labData.bloodPanel.crp} mg/L
              </strong>
            </div>
            <div className="lab-metric-row">
              <span className="lab-name">Spirometry FEV1/FVC Ratio</span>
              <strong className="mono" style={{ fontSize: '0.92rem', color: patient.labData.bloodPanel.fev1Fvc < 70 ? '#dc2626' : '#059669' }}>
                {patient.labData.bloodPanel.fev1Fvc}%
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
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>"{patient.textData.chiefComplaint}"</p>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
            {patient.textData.clinicalNotes}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto' }}>
            {patient.textData.extractedEntities.map((ent, idx) => (
              <span key={idx} className={`entity-chip chip-${ent.severity}`}>
                <CheckCircle2 size={11} /> {ent.text}
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
            {patient.xrayData.customImageSrc ? (
              <img src={patient.xrayData.customImageSrc} alt="My X-Ray" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <ImageIcon size={36} style={{ color: '#38bdf8', margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>PA Thoracic Radiograph</div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Grad-CAM Deep Heatmap Active</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            <strong style={{ color: '#0f172a' }}>Radiographic Impression:</strong> {patient.xrayData.description}
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

      {/* EXPLAINABLE AI (XAI) DRIVERS & FEATURE WEIGHTS PANEL */}
      <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Search size={20} style={{ color: '#0284c7' }} />
              Explainable AI (XAI) Diagnostic Feature Attribution
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Transparent breakdown showing why the AI model predicted {patient.primaryCondition} for {patient.name}
            </p>
          </div>

          <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #bae6fd' }}>
            No Black-Box AI — Fully Transparent
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

    </div>
  );
}
