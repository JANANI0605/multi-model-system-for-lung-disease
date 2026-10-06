import React from 'react';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, HelpCircle, FileCheck, Layers } from 'lucide-react';

export default function DiagnosticResultsView({ fusionResults, activePatient }) {
  const predictions = fusionResults?.diseasePredictions || activePatient?.fusionResults?.diseasePredictions || [];
  const xaiDrivers = fusionResults?.xaiDrivers || activePatient?.fusionResults?.xaiDrivers || [];

  const getProgressColor = (prob) => {
    if (prob > 75) return '#dc2626';
    if (prob > 40) return '#d97706';
    if (prob > 20) return '#0284c7';
    return '#059669';
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'Emergency': case 'Critical': return 'chip-high';
      case 'High': return 'chip-medium';
      case 'Normal': default: return 'chip-low';
    }
  };

  return (
    <div className="results-grid">
      {/* Left Card: Multi-Label Joint Predictions */}
      <div className="results-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Activity size={20} style={{ color: '#0284c7' }} />
              Combined Diagnostic Findings
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Overall Risk Breakdown Across Conditions</p>
          </div>

          <span className={`entity-chip ${getSeverityBadgeClass(activePatient?.severity || 'Normal')}`}>
            <AlertTriangle size={12} />
            {activePatient?.severity || 'Normal Risk'}
          </span>
        </div>

        {/* Prediction Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {predictions.map((item, idx) => {
            const rawVal = item.probability !== undefined ? item.probability : (item.confidence_score || 0);
            const probNum = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal) || 0;

            return (
              <div key={idx} className="probability-bar-row">
                <div className="disease-info-header">
                  <span style={{ color: probNum > 50 ? '#0f172a' : '#64748b', fontWeight: probNum > 50 ? 700 : 500 }}>
                    {item.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.status}</span>
                    <strong className="mono" style={{ color: probNum > 75 ? '#dc2626' : probNum > 40 ? '#d97706' : '#0f172a' }}>
                      {probNum.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, Math.max(0, probNum))}%`, background: getProgressColor(probNum) }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Card: Key Health Evidence Drivers */}
      <div className="results-card">
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
            <Sparkles size={20} style={{ color: '#0284c7' }} />
            Key Health Evidence Drivers
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Specific Factors Supporting This Assessment</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {xaiDrivers.map((driver, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '10px', borderLeft: `4px solid ${driver.modality === 'Vision' ? '#0284c7' : driver.modality === 'Lab' ? '#0d9488' : '#0284c7'}`, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                {driver.modality} Modality Driver
              </div>
              <p style={{ fontSize: '0.84rem', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>
                "{typeof driver.detail === 'string' ? driver.detail : JSON.stringify(driver.detail || '')}"
              </p>
            </div>
          ))}
        </div>

        {/* Clinical Recommendation Brief */}
        <div style={{ marginTop: 'auto', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.8rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileCheck size={14} /> Clinical Decision Support Action:
          </div>
          <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px' }}>
            Multimodal fusion indicates high diagnostic confidence for <strong>{activePatient?.primaryCondition || 'Baseline Assessment'}</strong>. Correlate with clinical response and consider targeted therapeutic protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
