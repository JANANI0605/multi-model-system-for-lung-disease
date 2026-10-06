import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import { fetchPatientsFromDb, savePatientRecordToDb } from './utils/mlApi';

export default function App() {
  const [customPatients, setCustomPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewMode, setViewMode] = useState('patient_portal'); // 'patient_portal' | 'xai_explain' | 'upload' | 'workstation'

  // Patient Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('pulse_fusion_auth') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('pulse_fusion_role') || 'patient';
  });

  // Fetch initial patient records from Database on mount
  useEffect(() => {
    async function loadMongoPatients() {
      const dbPatients = await fetchPatientsFromDb();
      if (dbPatients && dbPatients.length > 0) {
        setCustomPatients(dbPatients);
        const savedPatientId = localStorage.getItem('pulse_fusion_patient_id');
        if (savedPatientId) {
          const match = dbPatients.find(p => p.id === savedPatientId || p.mrn === savedPatientId);
          if (match) setActivePatient(match);
          else setActivePatient(dbPatients[0]);
        } else {
          setActivePatient(dbPatients[0]);
        }
      } else {
        setCustomPatients([]);
        setActivePatient(null);
      }
    }
    loadMongoPatients();
  }, []);

  const handlePatientLogin = (patient) => {
    if (!patient) return;
    setActivePatient(patient);
    setIsAuthenticated(true);
    setUserRole('patient');
    setViewMode('patient_portal');
    setCustomPatients(prev => {
      const filtered = (prev || []).filter(p => p.id !== patient.id && p.mrn !== patient.mrn);
      return [patient, ...filtered];
    });
    localStorage.setItem('pulse_fusion_auth', 'true');
    localStorage.setItem('pulse_fusion_role', 'patient');
    localStorage.setItem('pulse_fusion_patient_id', patient.id);
  };

  const handleClinicianLogin = () => {
    setIsAuthenticated(true);
    setUserRole('clinician');
    setViewMode('workstation');
    if (!activePatient && customPatients.length > 0) {
      setActivePatient(customPatients[0]);
    }
    localStorage.setItem('pulse_fusion_auth', 'true');
    localStorage.setItem('pulse_fusion_role', 'clinician');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActivePatient(null);
    localStorage.removeItem('pulse_fusion_auth');
    localStorage.removeItem('pulse_fusion_role');
    localStorage.removeItem('pulse_fusion_patient_id');
  };

  const handleRegisterPatient = (newPatient) => {
    setCustomPatients(prev => {
      const filtered = (prev || []).filter(p => p.id !== newPatient.id && p.mrn !== newPatient.mrn);
      return [newPatient, ...filtered];
    });
  };

  const handleRunFusionFromUpload = (uploadPackage) => {
    const targetPatient = activePatient || {};
    const analyzedPatient = analyzeCustomPatientData({
      demographics: {
        id: targetPatient.id || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: uploadPackage.patientName || targetPatient.name || 'Registered Patient',
        age: uploadPackage.patientAge || targetPatient.age || 35,
        gender: uploadPackage.patientGender || targetPatient.gender || 'Female',
        mrn: targetPatient.mrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`
      },
      textData: {
        chiefComplaint: uploadPackage.symptomsText ? uploadPackage.symptomsText.slice(0, 120) : targetPatient.textData?.chiefComplaint || 'Uploaded medical record',
        clinicalNotes: uploadPackage.symptomsText || targetPatient.textData?.clinicalNotes || 'Uploaded medical record'
      },
      labData: {
        vitals: {
          spo2: uploadPackage.parsedLabs?.spo2 || targetPatient.labData?.vitals?.spo2 || 98,
          temp: uploadPackage.parsedLabs?.temp || targetPatient.labData?.vitals?.temp || 37.0,
          respRate: uploadPackage.parsedLabs?.respRate || targetPatient.labData?.vitals?.respRate || 16,
          heartRate: 98,
          bloodPressure: '132/86'
        },
        bloodPanel: {
          wbc: uploadPackage.parsedLabs?.wbc || targetPatient.labData?.bloodPanel?.wbc || 6.5,
          crp: uploadPackage.parsedLabs?.crp || targetPatient.labData?.bloodPanel?.crp || 2.5,
          procalcitonin: uploadPackage.parsedLabs?.procalcitonin || targetPatient.labData?.bloodPanel?.procalcitonin || 0.1,
          paO2FiO2: 260,
          fev1Fvc: uploadPackage.parsedLabs?.fev1Fvc || targetPatient.labData?.bloodPanel?.fev1Fvc || 82
        }
      },
      xrayImage: uploadPackage.xrayPreview || targetPatient.xrayData?.customImageSrc,
      xrayFileName: uploadPackage.xrayFileName || targetPatient.xrayData?.imageType
    });

    savePatientRecordToDb(analyzedPatient);
    setActivePatient(analyzedPatient);
    setCustomPatients(prev => {
      const filtered = (prev || []).filter(p => p.id !== analyzedPatient.id && p.mrn !== analyzedPatient.mrn);
      return [analyzedPatient, ...filtered];
    });
    setViewMode('patient_portal');
  };

  const handleSelectPatient = (patient) => {
    if (patient) setActivePatient(JSON.parse(JSON.stringify(patient)));
  };

  const handleChangeText = (newNotes) => {
    setActivePatient(prev => {
      if (!prev) return null;
      const updated = analyzeCustomPatientData({
        demographics: { id: prev.id, name: prev.name, age: prev.age, gender: prev.gender, mrn: prev.mrn },
        textData: { chiefComplaint: prev.textData?.chiefComplaint || newNotes.slice(0, 100), clinicalNotes: newNotes },
        labData: prev.labData || {},
        xrayImage: prev.xrayData?.customImageSrc,
        xrayFileName: prev.xrayData?.imageType
      });
      savePatientRecordToDb(updated);
      return updated;
    });
  };

  const handleChangeLab = (newLab) => {
    setActivePatient(prev => {
      if (!prev) return null;
      const updated = analyzeCustomPatientData({
        demographics: { id: prev.id, name: prev.name, age: prev.age, gender: prev.gender, mrn: prev.mrn },
        textData: prev.textData || {},
        labData: newLab,
        xrayImage: prev.xrayData?.customImageSrc,
        xrayFileName: prev.xrayData?.imageType
      });
      savePatientRecordToDb(updated);
      return updated;
    });
  };

  const handleUpdateXray = (newXray) => {
    setActivePatient(prev => {
      if (!prev) return null;
      const updatedXraySrc = newXray?.customImageSrc || prev.xrayData?.customImageSrc;
      const updatedXrayType = newXray?.imageType || prev.xrayData?.imageType;
      const updated = analyzeCustomPatientData({
        demographics: { id: prev.id, name: prev.name, age: prev.age, gender: prev.gender, mrn: prev.mrn },
        textData: prev.textData || {},
        labData: prev.labData || {},
        xrayImage: updatedXraySrc,
        xrayFileName: updatedXrayType
      });
      savePatientRecordToDb(updated);
      return updated;
    });
  };

  // IF NOT AUTHENTICATED OR NO ACTIVE PATIENT: RENDER PATIENT LOGIN SCREEN
  if (!isAuthenticated || !activePatient) {
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
                Patient: {activePatient.name}
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
