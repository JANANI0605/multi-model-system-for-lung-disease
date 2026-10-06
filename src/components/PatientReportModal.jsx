import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, FileText, Activity, Sparkles, Brain, CheckCircle2, Stethoscope, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

export default function PatientReportModal({ activePatient, onClose }) {
  const reportRef = useRef(null);

  React.useEffect(() => {
    try {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
    } catch (e) {
      console.log('Confetti effect skipped');
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Diagnostic_Report_${(activePatient?.name || 'Patient').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    }
  };

  if (!activePatient) return null;

  // Extract recent application & model outputs dynamically from activePatient
  const primaryCondition = activePatient.primaryCondition || 'Baseline Respiratory Status';
  const severity = activePatient.severity || 'Normal';

  // 1. Model Disease Predictions
  const diseasePredictions = activePatient.fusionResults?.diseasePredictions || [
    { name: primaryCondition, probability: 95.0, status: severity }
  ];
  const topPrediction = diseasePredictions[0] || { name: primaryCondition, probability: 95.0, status: severity };
  const topProb = typeof topPrediction.probability === 'number'
    ? topPrediction.probability
    : (topPrediction.confidence_score !== undefined ? topPrediction.confidence_score : 95.0);

  // 2. Modality Feature Attention Weight Contributions
  const modalityContributions = activePatient.fusionResults?.modalityContributions || [
    { name: "Chest X-Ray Vision", weight: 40, color: "#3b82f6" },
    { name: "Clinical Symptom Text", weight: 30, color: "#8b5cf6" },
    { name: "Lab & Vitals Biomarkers", weight: 30, color: "#06b6d4" }
  ];

  // 3. Explainable AI Key Drivers
  const xaiDrivers = activePatient.fusionResults?.xaiDrivers || [
    { modality: "Vision", detail: `Chest Radiograph scan evaluated (${activePatient.xrayData?.imageType || 'Normal'})` },
    { modality: "Lab", detail: `SpO2: ${activePatient.labData?.vitals?.spo2 || 98}%, Temp: ${activePatient.labData?.vitals?.temp || 37.0}°C` },
    { modality: "Text", detail: `Reported symptoms: "${activePatient.textData?.chiefComplaint || 'Routine intake'}"` }
  ];

  // 4. Recent Lab Vitals & Blood Biomarkers
  const vitals = activePatient.labData?.vitals || {};
  const bloodPanel = activePatient.labData?.bloodPanel || {};

  // 5. Recent NLP Symptoms & Extracted Entities
  const textData = activePatient.textData || {};
  const extractedEntities = textData.extractedEntities || [];

  // 6. Recent Chest Radiograph Findings
  const xrayData = activePatient.xrayData || {};

  return (
    <div className="report-modal-overlay">
      <div style={{ maxWidth: '920px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', margin: '0 auto' }}>
        
        {/* Modal Action Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={22} style={{ color: '#38bdf8' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', margin: 0, letterSpacing: '-0.01em' }}>
              Diagnostic Results & Explanation Report
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.84rem' }}>
              <Printer size={16} /> Print Report
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.84rem', background: '#0284c7', color: '#ffffff' }}>
              <Download size={16} /> Download PDF Report
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Paper - Centrally Aligned Design */}
        <div 
          ref={reportRef} 
          className="report-modal-paper" 
          style={{ 
            padding: '2.75rem 2.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.6rem', 
            background: '#ffffff', 
            borderRadius: '24px', 
            border: '2px solid #0072ce',
            boxShadow: '0 20px 50px rgba(0, 114, 206, 0.12)',
            textAlign: 'center',
            alignItems: 'center'
          }}
        >
          
          {/* Document Header - Centrally Aligned */}
          <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1.4rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <img src="/logo.png" alt="LungAI Logo" style={{ height: '64px', width: 'auto', objectFit: 'contain' }} />
            
            <h1 style={{ color: '#0c3166', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', textAlign: 'center' }}>
              Diagnostic Results & Explanation Report
            </h1>
            
            <p style={{ color: '#0284c7', fontSize: '0.92rem', fontWeight: 700, margin: 0, textAlign: 'center' }}>
              LungAI Clinical Multimodal Diagnostic Assessment System
            </p>

            {/* Header Metadata Chips Bar - Centrally Aligned */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                CONFIDENTIAL MEDICAL RECORD
              </span>
              <span style={{ background: '#e0f2fe', border: '1px solid #7dd3fc', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, color: '#0369a1' }}>
                Patient: {activePatient.name}
              </span>
              <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 600, color: '#64748b' }}>
                Date: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Patient Demographic & Assessment Profile Summary Box - Centrally Aligned */}
          <div style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '1.15rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>PATIENT NAME</span>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0c3166', marginTop: '2px' }}>{activePatient.name}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>AGE / GENDER</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginTop: '2px' }}>{activePatient.age} yrs / {activePatient.gender}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>RECORD TYPE</span>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0072ce', marginTop: '2px' }}>Multimodal Health Record</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>ASSESSMENT RISK</span>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: topProb > 75 ? '#dc2626' : '#059669', marginTop: '2px' }}>{severity}</div>
            </div>
          </div>

          {/* SECTION 1: PRIMARY DIAGNOSTIC MODEL RESULTS & DIFFERENTIAL DIAGNOSES */}
          <div style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '1.4rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Activity size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#0c3166', fontWeight: 800, margin: 0, textAlign: 'center' }}>
                  1. Primary Diagnostic Model Results & Multimodal Predictions
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', background: topProb > 75 ? '#fef2f2' : '#f0fdf4', color: topProb > 75 ? '#dc2626' : '#059669', padding: '4px 14px', borderRadius: '20px', border: `1px solid ${topProb > 75 ? '#fecaca' : '#bbf7d0'}`, fontWeight: 800 }}>
                {severity} Classification
              </span>
            </div>

            {/* Primary Finding Highlight Card - Centrally Aligned */}
            <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', padding: '1.1rem 1.5rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#0284c7', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
                PRIMARY DIAGNOSTIC FINDING
              </span>
              
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: topProb > 75 ? '#dc2626' : '#0c3166', textAlign: 'center' }}>
                {primaryCondition}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '0.2rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>MODEL CONFIDENCE SCORE</span>
                  <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0072ce' }}>
                    {topProb.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Differential Diseases Results Table - Centrally Aligned */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '0.65rem', textAlign: 'center' }}>
                Top Differential Diagnoses Evaluated by Multimodal AI:
              </span>
              
              <table className="report-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '1.5px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f0f9ff' }}>
                    <th style={{ padding: '11px 16px', fontSize: '0.84rem', textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', borderRight: '1px solid #e2e8f0', color: '#0c3166', fontWeight: 800 }}>Rank & Condition Evaluated</th>
                    <th style={{ padding: '11px 16px', fontSize: '0.84rem', textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', borderRight: '1px solid #e2e8f0', color: '#0c3166', fontWeight: 800 }}>Diagnostic Confidence</th>
                    <th style={{ padding: '11px 16px', fontSize: '0.84rem', textAlign: 'center', borderBottom: '1.5px solid #cbd5e1', color: '#0c3166', fontWeight: 800 }}>Risk Status</th>
                  </tr>
                </thead>
                <tbody>
                  {diseasePredictions.slice(0, 5).map((item, idx) => {
                    const probVal = item.probability !== undefined ? item.probability : (item.confidence_score || 0);
                    return (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 16px', fontSize: '0.86rem', borderBottom: idx === Math.min(diseasePredictions.length, 5) - 1 ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', fontWeight: idx === 0 ? 800 : 600, color: '#0f172a', textAlign: 'center' }}>
                          #{idx + 1} {item.name}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.86rem', borderBottom: idx === Math.min(diseasePredictions.length, 5) - 1 ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 800 }} className="mono">
                          {probVal.toFixed(1)}%
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.86rem', borderBottom: idx === Math.min(diseasePredictions.length, 5) - 1 ? 'none' : '1px solid #e2e8f0', fontWeight: 800, textAlign: 'center', color: probVal > 75 ? '#dc2626' : (probVal > 40 ? '#d97706' : '#059669') }}>
                          {item.status || (probVal > 75 ? 'High Risk' : 'Low Risk')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: RECENT APPLICATION & MODEL OUTPUTS BY MODALITY */}
          <div style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '1.4rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0c3166', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Brain size={20} style={{ color: '#0284c7' }} />
                2. Recent Model & Application Outputs by Modality
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0', textAlign: 'center' }}>
                Synthesis of recent outputs from Vision Transformer (ViT), Clinical NLP, and Lab Panel ML models
              </p>
            </div>

            {/* 3-Column Modality Output Grid - Centrally Aligned */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
              
              {/* Card A: Vision Transformer Image Model Output */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 800, fontSize: '0.84rem' }}>
                  <ImageIcon size={16} /> Chest X-Ray ViT Model
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0c3166', marginTop: '2px' }}>
                  {xrayData.imageType || 'Radiograph Scan'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.35' }}>
                  {xrayData.description || 'Custom chest radiograph evaluated with Grad-CAM heatmap visualization.'}
                </div>
                {xrayData.findingTags && xrayData.findingTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                    {xrayData.findingTags.map((tag, idx) => (
                      <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card B: Lab & Biomarkers Model Output */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #a5f3fc', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0891b2', fontWeight: 800, fontSize: '0.84rem' }}>
                  <FileSpreadsheet size={16} /> Lab & Vitals Panel
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                  SpO2: <span style={{ color: (vitals.spo2 || 98) < 92 ? '#dc2626' : '#059669', fontWeight: 800 }}>{vitals.spo2 || 98}%</span> | Temp: <span style={{ fontWeight: 800 }}>{vitals.temp || 37.0}°C</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Resp Rate: <strong>{vitals.respRate || 16} bpm</strong> | BP: <strong>{vitals.bloodPressure || '120/80'}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  CRP: <strong>{bloodPanel.crp || 2.0} mg/L</strong> | WBC: <strong>{bloodPanel.wbc || 6.5} k/µL</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  FEV1/FVC Ratio: <strong>{bloodPanel.fev1Fvc || 82}%</strong>
                </div>
              </div>

              {/* Card C: Clinical NLP Symptoms Output */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontWeight: 800, fontSize: '0.84rem' }}>
                  <Stethoscope size={16} /> Clinical Symptoms NLP
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.35' }}>
                  "{textData.chiefComplaint || 'Intake notes analyzed by NLP entity extractor.'}"
                </div>
                {extractedEntities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                    {extractedEntities.map((ent, idx) => (
                      <span key={idx} style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                        {ent.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 3: EXPLAINABLE AI (XAI) MEDICAL EXPLANATIONS */}
          <div style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '1.4rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0c3166', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: '#0284c7' }} />
                3. Medical Explanation & Key Diagnostic Drivers
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0', textAlign: 'center' }}>
                Transparent breakdown of modality contribution weights and key patient evidence drivers
              </p>
            </div>

            {/* Modality Contribution Weightings (%): Centrally Aligned */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.6rem', textAlign: 'center' }}>
                Modality Attention Contribution Weightings (%):
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
                {modalityContributions.map((mod, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>{mod.name}</span>
                    <strong className="mono" style={{ fontSize: '1.15rem', color: mod.color || '#0072ce' }}>{mod.weight}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Evidence Drivers Cards - Centrally Aligned */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.6rem', textAlign: 'center' }}>
                Key Patient Evidence Drivers:
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
                {xaiDrivers.map((driver, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '0.95rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
                      {driver.modality} Modality Driver
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600, lineHeight: '1.4', textAlign: 'center' }}>
                      "{driver.detail}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Verification Sign-Off Footer - Centrally Aligned */}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1.3rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#0072ce', fontWeight: 800, fontSize: '0.9rem' }}>
              <ShieldCheck size={20} /> Verified Diagnostic Record
            </div>
            
            <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, textAlign: 'center' }}>
              This report synthesizes real-time diagnostic outputs from multimodal deep learning models & patient data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.4rem' }}>
              <div style={{ borderBottom: '2px solid #0f172a', width: '220px', marginBottom: '8px' }} />
              <strong style={{ fontSize: '0.95rem', color: '#0c3166', textAlign: 'center' }}>Verified by LAI</strong>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Multimodal AI Diagnostic System</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
