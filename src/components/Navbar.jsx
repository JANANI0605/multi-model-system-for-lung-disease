import React from 'react';
import { User, Stethoscope, Upload, Download, LogOut, HeartPulse, Search, Bell } from 'lucide-react';

export default function Navbar({ currentView, onChangeView, onOpenReport, activePatient, userRole, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-container">
        
        {/* Brand Identity with Official LungAI Logo */}
        <div className="brand-container">
          <img 
            src="/logo.png" 
            alt="LungAI Logo" 
            style={{ height: '42px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => onChangeView('patient_portal')}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="brand-title" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              <span style={{ color: '#0c3166' }}>Lung</span>
              <span style={{ color: '#0072ce' }}>AI</span>
            </h1>
            <span className="brand-badge" style={{ background: '#e0f2fe', color: '#0072ce', border: '1px solid #7dd3fc', fontWeight: 700, borderRadius: '20px', padding: '2px 10px', fontSize: '0.72rem' }}>
              {userRole === 'patient' ? 'Patient Portal' : 'Doctor Mode'}
            </span>
          </div>
        </div>

        {/* Main Floating Pill Navigation Bar (Matching Reference Image Style) */}
        <nav className="nav-pill-track">
          <button
            onClick={() => onChangeView('patient_portal')}
            className={`nav-pill-btn ${currentView === 'patient_portal' ? 'active' : ''}`}
          >
            <HeartPulse size={16} />
            <span>Health Summary</span>
          </button>

          <button
            onClick={() => onChangeView('xai_explain')}
            className={`nav-pill-btn ${currentView === 'xai_explain' ? 'active' : ''}`}
          >
            <Search size={16} />
            <span>Medical Explanation</span>
          </button>

          <button
            onClick={() => onChangeView('upload')}
            className={`nav-pill-btn ${currentView === 'upload' ? 'active' : ''}`}
          >
            <Upload size={16} />
            <span>Update Records</span>
          </button>

          {userRole === 'clinician' && (
            <button
              onClick={() => onChangeView('workstation')}
              className={`nav-pill-btn ${currentView === 'workstation' ? 'active' : ''}`}
            >
              <Stethoscope size={16} />
              <span>Doctor Workstation</span>
            </button>
          )}
        </nav>

        {/* Active User Avatar & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <button 
            onClick={onOpenReport}
            className="btn-primary"
            title="Download PDF Report"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)', borderRadius: '9999px', boxShadow: '0 4px 14px rgba(12, 49, 102, 0.25)' }}
          >
            <Download size={15} />
            <span>PDF Report</span>
          </button>

          <div 
            style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}
            title="System Notifications Active"
          >
            <Bell size={17} />
          </div>

          {activePatient && (
            <div 
              className="nav-avatar-circle"
              title={`${activePatient.name} (Active Record)`}
            >
              <User size={18} />
            </div>
          )}

          <button
            onClick={onLogout}
            style={{ padding: '0.45rem 0.85rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.8rem', borderRadius: '9999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
            title="Sign out of patient session"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

        </div>
      </div>
    </header>
  );
}
