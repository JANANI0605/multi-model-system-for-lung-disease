import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadWorkspace from './components/UploadWorkspace';
import PatientSelector from './components/PatientSelector';
import PatientPortalView from './components/PatientPortalView';
import ModalityTextPanel from './components/ModalityTextPanel';
import ModalityLabPanel from './components/ModalityLabPanel';
import ModalityXrayPanel from './components/ModalityXrayPanel';
import FusionEngineView from './components/FusionEngineView';
import DiagnosticResultsView from './components/DiagnosticResultsView';
import PatientReportModal from './components/PatientReportModal';
import PatientLoginScreen from './components/PatientLoginScreen';
import { analyzeCustomPatientData } from './utils/fusionAnalyzer';
import { PATIENT_PRESETS } from './data/clinicalData';
import { ArrowLeft, Search, Layers, Sparkles } from 'lucide-react';
import './styles/main.css';

export default function App() {
  const [customPatients, setCustomPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(PATIENT_PRESETS[0]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewMode, setViewMode] = useState('patient_portal'); // 'patient_portal' | 'xai_explain' | 'upload' | 'workstation'

  // Patient Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('pulse_fusion_auth') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('pulse_fusion_role') || 'patient';
  });

  // Restore logged-in patient from LocalStorage if available
  useEffect(() => {
    const savedPatientId = localStorage.getItem('pulse_fusion_patient_id');
    if (savedPatientId) {
      const all = [...customPatients, ...PATIENT_PRESETS];
      const match = all.find(p => p.id === savedPatientId);
      if (match) {
        setActivePatient(match);
      }
    }
  }, []);

  const handlePatientLogin = (patient) => {
    setActivePatient(patient);
    setIsAuthenticated(true);
    setUserRole('patient');
    setViewMode('patient_portal');
    localStorage.setItem('pulse_fusion_auth', 'true');
    localStorage.setItem('pulse_fusion_role', 'patient');
    localStorage.setItem('pulse_fusion_patient_id', patient.id);
  };

  const handleClinicianLogin = () => {
    setIsAuthenticated(true);
    setUserRole('clinician');
    setViewMode('workstation');
    localStorage.setItem('pulse_fusion_auth', 'true');
    localStorage.setItem('pulse_fusion_role', 'clinician');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pulse_fusion_auth');
    localStorage.removeItem('pulse_fusion_role');
    localStorage.removeItem('pulse_fusion_patient_id');
  };

  const handleRegisterPatient = (newPatient) => {
    setCustomPatients(prev => [newPatient, ...prev]);
  };

  const handleRunFusionFromUpload = (uploadPackage) => {
    const analyzedPatient = analyzeCustomPatientData({
      demographics: {
        name: uploadPackage.patientName || activePatient.name,
        age: uploadPackage.patientAge || activePatient.age,
        gender: uploadPackage.patientGender || activePatient.gender,
        mrn: activePatient.mrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`
      },
      textData: {
        chiefComplaint: uploadPackage.symptomsText.slice(0, 120) || activePatient.textData.chiefComplaint,
        clinicalNotes: uploadPackage.symptomsText || activePatient.textData.clinicalNotes
      },
      labData: {
        vitals: {
          spo2: uploadPackage.parsedLabs.spo2 || activePatient.labData.vitals.spo2,
          temp: uploadPackage.parsedLabs.temp || activePatient.labData.vitals.temp,
          respRate: uploadPackage.parsedLabs.respRate || activePatient.labData.vitals.respRate,
          heartRate: 98,
          bloodPressure: '132/86'
        },
        bloodPanel: {
          wbc: uploadPackage.parsedLabs.wbc || activePatient.labData.bloodPanel.wbc,
          crp: uploadPackage.parsedLabs.crp || activePatient.labData.bloodPanel.crp,
          procalcitonin: uploadPackage.parsedLabs.procalcitonin || activePatient.labData.bloodPanel.procalcitonin,
          paO2FiO2: 260,
          fev1Fvc: uploadPackage.parsedLabs.fev1Fvc || activePatient.labData.bloodPanel.fev1Fvc
        }
      },
      xrayImage: uploadPackage.xrayPreview || activePatient.xrayData.customImageSrc,
      xrayFileName: uploadPackage.xrayFileName || activePatient.xrayData.imageType
    });

    setActivePatient(analyzedPatient);
    setCustomPatients(prev => {
      const filtered = prev.filter(p => p.id !== analyzedPatient.id);
      return [analyzedPatient, ...filtered];
    });
    setViewMode('patient_portal');
  };

  const handleSelectPatient = (patient) => {
    setActivePatient(JSON.parse(JSON.stringify(patient)));
  };

  const handleChangeText = (newNotes) => {
    setActivePatient(prev => {
      const updated = { ...prev };
      updated.textData.clinicalNotes = newNotes;
      return updated;
    });
  };

  const handleChangeLab = (newLab) => {
    setActivePatient(prev => {
      const updated = { ...prev };
      updated.labData = newLab;
      if (newLab.vitals.spo2 < 85 || newLab.bloodPanel.crp > 100) {
        updated.fusionResults.diseasePredictions[0].probability = Math.min(99.2, updated.fusionResults.diseasePredictions[0].probability + 3.5);
      }
      return updated;
    });
  };

  const handleUpdateXray = (newXray) => {
    setActivePatient(prev => ({
      ...prev,
      xrayData: { ...prev.xrayData, ...newXray }
    }));
  };

  // IF NOT AUTHENTICATED: RENDER PATIENT LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <PatientLoginScreen 
        onPatientLogin={handlePatientLogin}
        onClinicianLogin={handleClinicianLogin}
        onRegisterPatient={handleRegisterPatient}
        customPatients={customPatients}
      />
    );
  }

  return (
    <div className="app-root">
      {/* Top Navigation Bar */}
      <Navbar 
        currentView={viewMode}
        onChangeView={(view) => setViewMode(view)}
        onOpenReport={() => setShowReportModal(true)} 
        activePatient={activePatient}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <main className="main-dashboard">

        {/* VIEW 1: MY HEALTH SUMMARY */}
        {viewMode === 'patient_portal' && (
          <PatientPortalView 
            patient={activePatient}
            userRole={userRole}
            onOpenReport={() => setShowReportModal(true)}
            onOpenUpload={() => setViewMode('upload')}
            onOpenXai={() => setViewMode('xai_explain')}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW 2: DEDICATED EXPLAINABLE AI (XAI) BREAKDOWN */}
        {viewMode === 'xai_explain' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setViewMode('patient_portal')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <ArrowLeft size={16} /> Back to My Health Summary
              </button>

              <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 700 }}>
                Patient: {activePatient.name} ({activePatient.mrn})
              </span>
            </div>

            {/* Multimodal Feature Fusion Engine Visualizer */}
            <FusionEngineView 
              fusionResults={activePatient.fusionResults}
              activePatient={activePatient}
            />

            {/* Explainable AI Predictions & XAI Drivers */}
            <DiagnosticResultsView 
              fusionResults={activePatient.fusionResults}
              activePatient={activePatient}
            />
          </div>
        )}

        {/* VIEW 3: CLINICIAN WORKSTATION (DOCTOR ROLE) */}
        {viewMode === 'workstation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <PatientSelector 
              activePatient={activePatient} 
              customPatients={customPatients}
              onSelectPatient={handleSelectPatient}
              onOpenUpload={() => setViewMode('upload')}
            />

            <div className="modalities-grid">
              <ModalityTextPanel 
                textData={activePatient.textData}
                onChangeText={handleChangeText}
              />
              <ModalityLabPanel 
                labData={activePatient.labData}
                onChangeLab={handleChangeLab}
              />
              <ModalityXrayPanel 
                xrayData={activePatient.xrayData}
                onUpdateXray={handleUpdateXray}
              />
            </div>

            <FusionEngineView 
              fusionResults={activePatient.fusionResults}
              activePatient={activePatient}
            />

            <DiagnosticResultsView 
              fusionResults={activePatient.fusionResults}
              activePatient={activePatient}
            />
          </div>
        )}

        {/* VIEW 4: UPDATE MY MEDICAL RECORDS */}
        {viewMode === 'upload' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <button 
                onClick={() => setViewMode('patient_portal')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <ArrowLeft size={16} /> Back to My Health Summary ({activePatient.name})
              </button>
            </div>

            <UploadWorkspace 
              onRunFusion={handleRunFusionFromUpload}
              currentDataset={activePatient}
            />
          </div>
        )}

      </main>

      {/* Downloadable Combined Diagnostic Patient Report Modal */}
      {showReportModal && (
        <PatientReportModal 
          activePatient={activePatient}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
