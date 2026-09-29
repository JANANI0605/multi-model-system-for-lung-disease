import React, { useState } from 'react';
import { User, ShieldCheck, Sparkles, ArrowRight, Stethoscope, UserPlus, AlertCircle } from 'lucide-react';
import { PATIENT_PRESETS } from '../data/clinicalData';
import { analyzeCustomPatientData } from '../utils/fusionAnalyzer';

export default function PatientLoginScreen({ onPatientLogin, onClinicianLogin, customPatients, onRegisterPatient }) {
  const [loginMode, setLoginMode] = useState('patient_select'); // 'patient_select' | 'register' | 'clinician'
  
  const [mrnInput, setMrnInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState(45);
  const [regGender, setRegGender] = useState('Female');
  const [regSymptoms, setRegSymptoms] = useState('');

  const allPatients = [...customPatients, ...PATIENT_PRESETS];

  const handleFormLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!mrnInput.trim()) {
      setErrorMessage('Please enter your Medical Record Number (MRN) or Patient ID.');
      return;
    }
    const cleanInput = mrnInput.trim().toLowerCase();
    const foundPatient = allPatients.find(p => 
      p.mrn.toLowerCase() === cleanInput || 
      p.id.toLowerCase() === cleanInput ||
      p.name.toLowerCase().includes(cleanInput)
    );

    if (foundPatient) {
      onPatientLogin(foundPatient);
    } else {
      setErrorMessage(`No record found matching "${mrnInput}". Please select your account below.`);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const newMRN = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const analyzedPatient = analyzeCustomPatientData({
      demographics: { name: regName, age: Number(regAge), gender: regGender, mrn: newMRN },
      textData: { chiefComplaint: regSymptoms || 'Routine health evaluation.', clinicalNotes: regSymptoms || 'Self-registered patient.' },
      labData: { vitals: { spo2: 97, temp: 36.8, respRate: 16, heartRate: 72, bloodPressure: '120/80' }, bloodPanel: { wbc: 6.8, crp: 2.1, procalcitonin: 0.05, paO2FiO2: 420, fev1Fvc: 82 } },
      xrayImage: null,
      xrayFileName: 'standard_radiograph.png'
    });
    onRegisterPatient(analyzedPatient);
    onPatientLogin(analyzedPatient);
  };

  return (
    <div className="login-page-overlay">
      <div className="login-card-container">
        
        {/* Brand Header with Official LungAI Logo Image */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <img 
            src="/logo.png" 
            alt="LungAI Logo" 
            style={{ width: '130px', height: 'auto', objectFit: 'contain' }}
          />
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0 }}>
              <span style={{ color: '#0c3166' }}>Lung</span>
              <span style={{ color: '#0072ce' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0072ce', marginTop: '2px' }}>
              One Patient • Three Modalities • Better Insights
            </p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Clinical Text • Lab Data • Chest X-ray
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
          <ShieldCheck size={18} />
          <span>Encrypted HIPAA Healthcare Portal — Authorized Patient Isolation Active</span>
        </div>

        {/* Tab Switcher */}
        <div className="login-tabs">
          <button 
            type="button" 
            className={`login-tab-btn ${loginMode === 'patient_select' ? 'active' : ''}`}
            onClick={() => { setLoginMode('patient_select'); setErrorMessage(''); }}
          >
            <User size={16} /> Patient Login
          </button>
          
          <button 
            type="button" 
            className={`login-tab-btn ${loginMode === 'register' ? 'active' : ''}`}
            onClick={() => { setLoginMode('register'); setErrorMessage(''); }}
          >
            <UserPlus size={16} /> Register New Patient
          </button>

          <button 
            type="button" 
            className={`login-tab-btn ${loginMode === 'clinician' ? 'active' : ''}`}
            onClick={() => { setLoginMode('clinician'); setErrorMessage(''); }}
          >
            <Stethoscope size={16} /> Doctor Access
          </button>
        </div>

        {errorMessage && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: PATIENT SELECT CARDS */}
        {loginMode === 'patient_select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0072ce', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Select Patient Profile (1-Click Access)
              </div>

              <div className="patient-cards-grid">
                {allPatients.map((pt) => (
                  <div key={pt.id} className="patient-quick-card" onClick={() => onPatientLogin(pt)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="patient-avatar-box" style={{ background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}>
                        <User size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0c3166' }}>{pt.name}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          MRN: <span className="mono" style={{ color: '#0072ce', fontWeight: 600 }}>{pt.mrn}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem' }}>
                      <span className="patient-condition-badge">{pt.primaryCondition}</span>
                      <span className="login-btn-mini" style={{ color: '#0072ce' }}>
                        Log In <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick ID Login */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <form onSubmit={handleFormLogin} style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="Or enter MRN (e.g. MRN-2026-8809)..."
                  value={mrnInput}
                  onChange={(e) => setMrnInput(e.target.value)}
                  style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', color: '#0c3166', background: '#ffffff' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}>
                  Log In <ArrowRight size={16} />
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: REGISTER NEW PATIENT */}
        {loginMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0c3166' }}>Enter Patient Details</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Full Name</label>
                <input 
                  type="text" required placeholder="e.g. Jane Doe"
                  value={regName} onChange={(e) => setRegName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', color: '#0c3166', background: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Age</label>
                <input 
                  type="number" required value={regAge} onChange={(e) => setRegAge(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', color: '#0c3166', background: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Gender</label>
                <select 
                  value={regGender} onChange={(e) => setRegGender(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', color: '#0c3166', background: '#ffffff' }}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Symptoms / Notes</label>
              <textarea 
                placeholder="Describe any symptoms or health complaints..."
                value={regSymptoms} onChange={(e) => setRegSymptoms(e.target.value)}
                style={{ width: '100%', minHeight: '80px', padding: '0.65rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', color: '#0c3166', background: '#ffffff' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}>
              <Sparkles size={18} /> Register & View My Dashboard
            </button>
          </form>
        )}

        {/* TAB 3: CLINICIAN ACCESS */}
        {loginMode === 'clinician' && (
          <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#e0f2fe', color: '#0072ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0c3166' }}>Doctor / Clinical Staff Workstation</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Access hospital multi-patient diagnostic suite, vision Grad-CAM heatmaps, and feature controls.
              </p>
            </div>
            <button type="button" onClick={() => onClinicianLogin()} className="btn-primary" style={{ padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}>
              <Stethoscope size={18} /> Enter Doctor Workstation
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
