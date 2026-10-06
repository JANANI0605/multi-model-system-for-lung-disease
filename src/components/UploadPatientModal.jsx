import React, { useState } from 'react';
import { X, Upload, User, FileText, Activity, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight, Cpu, FileSpreadsheet } from 'lucide-react';
import { analyzeCustomPatientData } from '../utils/fusionAnalyzer';

export default function UploadPatientModal({ onClose, onSubmitPatient }) {
  const [step, setStep] = useState(1); // 1: Form, 2: AI Processing Animation

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState(52);
  const [gender, setGender] = useState('Male');
  const [mrn, setMrn] = useState(`MRN-${Math.floor(100000 + Math.random() * 900000)}`);

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [spo2, setSpo2] = useState(92);
  const [temp, setTemp] = useState(38.4);
  const [respRate, setRespRate] = useState(24);
  const [wbc, setWbc] = useState(14.2);
  const [crp, setCrp] = useState(88.5);
  const [fev1Fvc, setFev1Fvc] = useState(74);

  const [xrayFile, setXrayFile] = useState(null);
  const [xrayPreview, setXrayPreview] = useState(null);
  const [xrayFileName, setXrayFileName] = useState('');

  // Processing animation steps state
  const [analysisStage, setAnalysisStage] = useState(0);

  // Handle X-Ray File Selection
  const handleXraySelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setXrayFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setXrayPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick fill sample data button for convenience
  const handleQuickFill = () => {
    setName('Marcus Vance');
    setAge(61);
    setGender('Male');
    setChiefComplaint('Fever, right chest pain, productive purulent cough');
    setClinicalNotes('61-year-old male with 3 days of high fever (38.8°C), right pleuritic chest pain, and thick yellow sputum. Decreased breath sounds at right lung base.');
    setSpo2(91);
    setTemp(38.8);
    setRespRate(26);
    setWbc(15.4);
    setCrp(112.0);
    setFev1Fvc(76);
  };

  // Submit and start Dynamic AI Fusion Pipeline
  const handleSubmit = (e) => {
    e.preventDefault();
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      alert('Please enter a valid age between 1 and 120.');
      return;
    }

    setStep(2); // Show AI Processing Animation

    // Step 1: Text NLP
    setTimeout(() => setAnalysisStage(1), 500);
    // Step 2: Lab Standardization
    setTimeout(() => setAnalysisStage(2), 1200);
    // Step 3: Vision Swin Feature Map
    setTimeout(() => setAnalysisStage(3), 1900);
    // Step 4: Unified Cross-Attention Fusion
    setTimeout(() => {
      setAnalysisStage(4);
      const customPatientObj = analyzeCustomPatientData({
        demographics: { name: name || 'Custom Intake Patient', age, gender, mrn },
        textData: { chiefComplaint, clinicalNotes },
        labData: {
          vitals: { spo2, temp, respRate, heartRate: 94, bloodPressure: '130/84' },
          bloodPanel: { wbc, crp, procalcitonin: 1.8, paO2FiO2: 280, fev1Fvc }
        },
        xrayImage: xrayPreview,
        xrayFileName
      });

      setTimeout(() => {
        onSubmitPatient(customPatientObj);
      }, 600);
    }, 2600);
  };

  return (
    <div className="report-modal-overlay">
      <div style={{ maxWidth: '820px', width: '100%', background: 'var(--bg-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: '0 0 50px rgba(6, 182, 212, 0.2)', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary-teal), var(--fusion-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Upload size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Intake New Patient Data</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload Patient Text, Labs, and X-Ray for Dynamic Multimodal Fusion</p>
            </div>
          </div>

          {step === 1 && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>

        {/* STEP 1: UPLOAD & INTAKE FORM */}
        {step === 1 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Fill Preset Helper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-cyan)' }}>Need a quick test? Auto-fill clinical sample fields:</span>
              <button type="button" onClick={handleQuickFill} style={{ background: 'var(--primary-teal)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                Auto-Fill Sample
              </button>
            </div>

            {/* 1. Demographics */}
            <div style={{ background: 'rgba(9, 13, 24, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> 1. Patient Demographics:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age (Years)</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Modality 1: Clinical Text */}
            <div style={{ background: 'rgba(9, 13, 24, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} /> 2. Modality 1 - Clinical Text & Symptoms:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Chief Complaint (e.g. High fever, purulent cough, right chest pain)"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
                <textarea
                  placeholder="Paste or type detailed clinical notes, medical history, physical examination findings..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', minHeight: '70px' }}
                />
              </div>
            </div>

            {/* 3. Modality 2: Laboratory Values */}
            <div style={{ background: 'rgba(9, 13, 24, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={14} /> 3. Modality 2 - Laboratory & Vital Measurements:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SpO2 (%)</label>
                  <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Temp (°C)</label>
                  <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Resp Rate</label>
                  <input type="number" value={respRate} onChange={(e) => setRespRate(e.target.value)} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WBC (k/µL)</label>
                  <input type="number" step="0.1" value={wbc} onChange={(e) => setWbc(e.target.value)} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CRP (mg/L)</label>
                  <input type="number" step="0.1" value={crp} onChange={(e) => setCrp(e.target.value)} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FEV1/FVC %</label>
                  <input type="number" value={fev1Fvc} onChange={(e) => setFev1Fvc(e.target.value)} style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.12)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>

            {/* 4. Modality 3: Chest X-Ray Upload */}
            <div style={{ background: 'rgba(9, 13, 24, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={14} /> 4. Modality 3 - Upload Chest X-Ray Radiograph:
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ flex: 1, border: '2px dashed rgba(59, 130, 246, 0.4)', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(15, 23, 42, 0.6)', transition: 'all 0.2s ease' }}>
                  <Upload size={24} style={{ color: '#60a5fa', margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {xrayFileName ? `Selected: ${xrayFileName}` : 'Click to Browse or Drag Chest X-Ray (DICOM / PNG / JPG)'}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports standard PA Radiographs up to 50MB</span>
                  <input type="file" accept="image/*" onChange={handleXraySelect} style={{ display: 'none' }} />
                </label>

                {xrayPreview && (
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--primary-cyan)' }}>
                    <img src={xrayPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                <Sparkles size={18} /> Run Dynamic Multimodal AI Fusion
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: LIVE AI FEATURE EXTRACTION & FUSION ANIMATION */}
        {step === 2 && (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="fusion-center-core" style={{ width: '120px', height: '120px' }}>
              <Cpu size={42} style={{ color: '#ffffff' }} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Processing Multimodal Fusion...</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Extracting representations for {name || 'Patient'} across 3 distinct deep neural backbones
              </p>
            </div>

            {/* Multi-step progress list */}
            <div style={{ maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisStage >= 1 ? 1 : 0.4 }}>
                <CheckCircle2 size={18} style={{ color: analysisStage >= 1 ? '#0072ce' : 'var(--text-dim)' }} />
                <span style={{ fontSize: '0.88rem' }}>1. Analyzing Clinical Symptom Notes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisStage >= 2 ? 1 : 0.4 }}>
                <CheckCircle2 size={18} style={{ color: analysisStage >= 2 ? '#0284c7' : 'var(--text-dim)' }} />
                <span style={{ fontSize: '0.88rem' }}>2. Standardizing Laboratory Biomarkers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisStage >= 3 ? 1 : 0.4 }}>
                <CheckCircle2 size={18} style={{ color: analysisStage >= 3 ? '#0d9488' : 'var(--text-dim)' }} />
                <span style={{ fontSize: '0.88rem' }}>3. Evaluating Chest Radiograph Imaging</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: analysisStage >= 4 ? 1 : 0.4 }}>
                <CheckCircle2 size={18} style={{ color: analysisStage >= 4 ? 'var(--status-normal)' : 'var(--text-dim)' }} />
                <strong style={{ fontSize: '0.88rem', color: analysisStage >= 4 ? 'var(--status-normal)' : '#fff' }}>
                  4. Integrated Diagnostic Assessment Complete!
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
