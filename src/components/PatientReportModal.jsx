import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Activity, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { SYSTEM_MODELS } from '../data/clinicalData';

export default function PatientReportModal({ activePatient, onClose }) {
  const reportRef = useRef(null);

  React.useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LungAI_Report_${activePatient.mrn}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    }
  };

  return (
    <div className="report-modal-overlay">
      <div style={{ maxWidth: '950px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: '#38bdf8' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>LungAI Patient Diagnostic Report</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn-primary" style={{ background: '#334155' }}>
              <Printer size={16} /> Print
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary" style={{ background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}>
              <Download size={16} /> Export PDF
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Paper */}
        <div ref={reportRef} className="report-modal-paper">
          {/* Hospital Header with Official LungAI Logo */}
          <div className="report-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src="/logo.png" alt="LungAI Logo" style={{ height: '54px', width: 'auto' }} />
              <div>
                <h1 style={{ color: '#0c3166', fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                  Lung<span style={{ color: '#0072ce' }}>AI</span> Diagnostic Center
                </h1>
                <p style={{ color: '#0072ce', fontSize: '0.82rem', fontWeight: 700 }}>
                  One Patient • Three Modalities • Better Insights
                </p>
                <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  Clinical Text • Lab Data • Chest X-ray
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>CONFIDENTIAL MEDICAL RECORD</div>
              <div className="mono" style={{ fontSize: '0.9rem', color: '#0072ce', fontWeight: 700 }}>REPORT ID: LAI-{Date.now().toString().slice(-6)}</div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Patient Demographics Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>PATIENT NAME</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0c3166' }}>{activePatient.name}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>MRN RECORD</span>
              <div className="mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0072ce' }}>{activePatient.mrn}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>AGE / GENDER</span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{activePatient.age} yrs / {activePatient.gender}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>ADMIT DATE</span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{activePatient.admitDate}</div>
            </div>
          </div>

          {/* Modality 1: Clinical Symptoms */}
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0c3166', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
              1. Clinical Text & Symptomatology (NLP Modality)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', marginBottom: '0.4rem' }}>
              "{activePatient.textData.clinicalNotes}"
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {activePatient.textData.extractedEntities.map((e, idx) => (
                <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#334155' }}>
                  <strong>{e.category}:</strong> {e.text}
                </span>
              ))}
            </div>
          </div>

          {/* Modality 2: Laboratory Findings */}
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0c3166', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
              2. Laboratory & Vital Sign Biomarkers (Tabular Modality)
            </h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Biomarker / Metric</th>
                  <th>Observed Value</th>
                  <th>Standard Reference Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SpO2 Oxygen Saturation</td>
                  <td><strong>{activePatient.labData.vitals.spo2}%</strong></td>
                  <td>95 - 100 %</td>
                  <td>{activePatient.labData.vitals.spo2 < 94 ? 'Abnormal (Hypoxemia)' : 'Normal'}</td>
                </tr>
                <tr>
                  <td>Core Body Temperature</td>
                  <td><strong>{activePatient.labData.vitals.temp} °C</strong></td>
                  <td>36.5 - 37.5 °C</td>
                  <td>{activePatient.labData.vitals.temp > 37.8 ? 'Elevated (Fever)' : 'Normal'}</td>
                </tr>
                <tr>
                  <td>WBC Leukocyte Count</td>
                  <td><strong>{activePatient.labData.bloodPanel.wbc} k/µL</strong></td>
                  <td>4.5 - 11.0 k/µL</td>
                  <td>{activePatient.labData.bloodPanel.wbc > 11.0 ? 'Leukocytosis' : 'Normal'}</td>
                </tr>
                <tr>
                  <td>C-Reactive Protein (CRP)</td>
                  <td><strong>{activePatient.labData.bloodPanel.crp} mg/L</strong></td>
                  <td>&lt; 5.0 mg/L</td>
                  <td>{activePatient.labData.bloodPanel.crp > 5.0 ? 'Markedly Elevated' : 'Normal'}</td>
                </tr>
                <tr>
                  <td>Spirometry FEV1/FVC</td>
                  <td><strong>{activePatient.labData.bloodPanel.fev1Fvc}%</strong></td>
                  <td>&gt; 70 %</td>
                  <td>{activePatient.labData.bloodPanel.fev1Fvc < 70 ? 'Airflow Obstruction' : 'Normal'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Modality 3: Chest X-Ray Radiography */}
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0c3166', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
              3. Radiographic Imaging Findings (Vision Modality)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Radiologist Impression:</strong> {activePatient.xrayData.description}
            </p>
          </div>

          {/* Multimodal Feature Fusion Results Table */}
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0c3166', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
              4. Multimodal AI Joint Predictions & Cross-Attention Attribution
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Top Differential Diagnoses:</span>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Condition</th>
                      <th>AI Confidence</th>
                      <th>Risk Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePatient.fusionResults.diseasePredictions.slice(0, 4).map((p, idx) => (
                      <tr key={idx}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.probability.toFixed(1)}%</td>
                        <td>{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Modality Feature Weights:</span>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Healthcare Modality</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePatient.fusionResults.modalityContributions.map((c, idx) => (
                      <tr key={idx}>
                        <td>{c.name}</td>
                        <td><strong>{c.weight}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Attending Physician Sign-Off Block */}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0072ce', fontWeight: 700, fontSize: '0.85rem' }}>
                <ShieldCheck size={16} /> Verified by LungAI Engine ({SYSTEM_MODELS.fusionEngine.name})
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                This report synthesizes text, lab measurements, and chest X-rays using late cross-attention feature fusion.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #0f172a', width: '200px', marginBottom: '4px' }} />
              <strong style={{ fontSize: '0.85rem', color: '#0c3166' }}>Dr. Sarah Jenkins, MD, FCCP</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Attending Pulmonologist & Radiologist</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
