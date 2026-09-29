import React from 'react';
import { User, Stethoscope, Upload, Download, LogOut, HeartPulse, Search } from 'lucide-react';

export default function Navbar({ currentView, onChangeView, onOpenReport, activePatient, userRole, onLogout }) {
  return (
    <header className="app-header">
      {/* Brand Identity with Official LungAI Logo */}
      <div className="brand-container">
        <img 
          src="/logo.png" 
          alt="LungAI Logo" 
          style={{ height: '48px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
          onClick={() => onChangeView('patient_portal')}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="brand-title" style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
              <span style={{ color: '#0c3166' }}>Lung</span>
              <span style={{ color: '#0072ce' }}>AI</span>
            </h1>
            <span className="brand-badge" style={{ background: '#e0f2fe', color: '#0072ce', border: '1px solid #7dd3fc', fontWeight: 700 }}>
              {userRole === 'patient' ? 'Patient Portal' : 'Doctor Mode'}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#0072ce', fontWeight: 600, letterSpacing: '0.02em', marginTop: '1px' }}>
            One Patient • Three Modalities • Better Insights
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <button
          onClick={() => onChangeView('patient_portal')}
          className={`preset-pill-btn ${currentView === 'patient_portal' ? 'active' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <HeartPulse size={16} />
          <span>My Health Summary</span>
        </button>

        <button
          onClick={() => onChangeView('xai_explain')}
          className={`preset-pill-btn ${currentView === 'xai_explain' ? 'active' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Search size={16} />
          <span>Explainable AI (XAI) Breakdown</span>
        </button>

        <button
          onClick={() => onChangeView('upload')}
          className={`preset-pill-btn ${currentView === 'upload' ? 'active' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
        >
          <Upload size={16} />
          <span>Update My Records</span>
        </button>

        {userRole === 'clinician' && (
          <button
            onClick={() => onChangeView('workstation')}
            className={`preset-pill-btn ${currentView === 'workstation' ? 'active' : ''}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
          >
            <Stethoscope size={16} />
            <span>Doctor Workstation</span>
          </button>
        )}
      </nav>

      {/* Active User Badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {activePatient && (
          <div className="nav-user-badge">
            <div className="nav-user-avatar" style={{ background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}>
              <User size={16} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0c3166', lineHeight: 1.1 }}>
                {activePatient.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#0072ce' }} className="mono">
                {activePatient.mrn}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onOpenReport}
          className="btn-primary"
          title="Download PDF Report"
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)' }}
        >
          <Download size={15} />
          <span>PDF Report</span>
        </button>

        <button
          onClick={onLogout}
          className="preset-pill-btn"
          style={{ padding: '0.5rem 0.8rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.8rem' }}
          title="Sign out of patient session"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>

      </div>
    </header>
  );
}
