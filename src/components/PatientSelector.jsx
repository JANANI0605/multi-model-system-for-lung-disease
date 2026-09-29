import React from 'react';
import { UserCheck, AlertTriangle, Zap, Upload, Plus } from 'lucide-react';
import { PATIENT_PRESETS } from '../data/clinicalData';

export default function PatientSelector({ activePatient, customPatients, onSelectPatient, onOpenUpload }) {
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'Emergency': case 'Critical': return 'chip-high';
      case 'High': return 'chip-medium';
      case 'Normal': default: return 'chip-low';
    }
  };

  const allPatients = [...customPatients, ...PATIENT_PRESETS];

  return (
    <div className="preset-bar-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={18} style={{ color: '#0284c7' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Active Patients:</span>
        </div>

        <div className="preset-pills">
          <button
            onClick={onOpenUpload}
            className="preset-pill-btn"
            style={{ background: '#e0f2fe', border: '1px dashed #0284c7', color: '#0284c7', fontWeight: 600 }}
          >
            <Plus size={14} />
            <span>+ Upload Custom Data</span>
          </button>

          {allPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`preset-pill-btn ${activePatient.id === patient.id ? 'active' : ''}`}
            >
              <Zap size={14} style={{ color: activePatient.id === patient.id ? '#ffffff' : '#0284c7' }} />
              <span>
                {patient.name} {patient.id.includes('CUST') ? '(Uploaded Data)' : `(${patient.primaryCondition})`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Patient Summary Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>ACTIVE PATIENT RECORD</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
            {activePatient.name} <span style={{ color: '#64748b', fontWeight: 400 }}>({activePatient.gender}, {activePatient.age}y)</span>
          </div>
        </div>

        <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />

        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>RECORD MRN</div>
          <div className="mono" style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>{activePatient.mrn}</div>
        </div>

        <span className={`entity-chip ${getSeverityBadgeClass(activePatient.severity)}`}>
          <AlertTriangle size={12} />
          {activePatient.severity} Status
        </span>
      </div>
    </div>
  );
}
