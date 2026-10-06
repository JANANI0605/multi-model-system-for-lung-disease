import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Heart, Wind, Gauge, AlertCircle, Cpu } from 'lucide-react';
import { SYSTEM_MODELS } from '../data/clinicalData';

export default function ModalityLabPanel({ labData, onChangeLab }) {
  const defaultVitals = { spo2: 98, temp: 37.0, respRate: 16, heartRate: 72, bloodPressure: '120/80' };
  const defaultPanel = { wbc: 6.5, crp: 2.5, procalcitonin: 0.1, paO2FiO2: 420, fev1Fvc: 82 };

  const [vitals, setVitals] = useState(labData?.vitals || defaultVitals);
  const [panel, setPanel] = useState(labData?.bloodPanel || defaultPanel);

  useEffect(() => {
    setVitals(labData?.vitals || defaultVitals);
    setPanel(labData?.bloodPanel || defaultPanel);
  }, [labData]);

  const handleVitalChange = (key, value) => {
    const updated = { ...vitals, [key]: parseFloat(value) || value };
    setVitals(updated);
    onChangeLab({ vitals: updated, bloodPanel: panel });
  };

  const handlePanelChange = (key, value) => {
    const updated = { ...panel, [key]: parseFloat(value) || value };
    setPanel(updated);
    onChangeLab({ vitals, bloodPanel: updated });
  };

  const getVitalStatus = (key, val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { label: 'Pending Input', color: '#64748b' };
    if (key === 'spo2') {
      if (num < 90) return { label: 'Severe Hypoxemia', color: '#dc2626' };
      if (num < 94) return { label: 'Mild Hypoxemia', color: '#d97706' };
      return { label: 'Normal', color: '#059669' };
    }
    if (key === 'temp') {
      if (num > 38.5) return { label: 'High Fever', color: '#dc2626' };
      if (num > 37.5) return { label: 'Low Fever', color: '#d97706' };
      return { label: 'Normal', color: '#059669' };
    }
    if (key === 'respRate') {
      if (num > 24) return { label: 'Tachypnea', color: '#dc2626' };
      return { label: 'Normal', color: '#059669' };
    }
    return { label: 'Normal', color: '#059669' };
  };

  return (
    <div className="modality-card">
      <div className="modality-header">
        <div className="modality-title">
          <div className="modality-icon-badge icon-lab">
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ color: '#0f172a' }}>Modality 2: Lab & Vitals</h3>
            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Biomarkers & Physiological Metrics</p>
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }} className="mono">
          [1 x 128 Vector]
        </span>
      </div>

      {/* Vital Signs Grid */}
      <div className="lab-metrics-table">
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Heart size={14} style={{ color: '#0284c7' }} /> Vital Signs & Oxygenation:
        </div>

        {/* SpO2 */}
        <div className="lab-metric-row">
          <div className="lab-name">
            <strong style={{ color: '#0f172a' }}>SpO2 Oxygen Saturation</strong>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: 95 - 100%</div>
          </div>
          <div className="lab-value-group">
            <input
              type="number"
              className="lab-input-number"
              value={vitals.spo2}
              onChange={(e) => handleVitalChange('spo2', e.target.value)}
              min="60"
              max="100"
            />
            <span style={{ fontSize: '0.78rem', color: '#0f172a' }}>%</span>
            <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', color: getVitalStatus('spo2', vitals.spo2).color, background: '#f8fafc', border: `1px solid ${getVitalStatus('spo2', vitals.spo2).color}`, fontWeight: 600 }}>
              {getVitalStatus('spo2', vitals.spo2).label}
            </span>
          </div>
        </div>

        {/* Body Temperature */}
        <div className="lab-metric-row">
          <div className="lab-name">
            <strong style={{ color: '#0f172a' }}>Core Body Temp</strong>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: 36.5 - 37.5 °C</div>
          </div>
          <div className="lab-value-group">
            <input
              type="number"
              step="0.1"
              className="lab-input-number"
              value={vitals.temp}
              onChange={(e) => handleVitalChange('temp', e.target.value)}
            />
            <span style={{ fontSize: '0.78rem', color: '#0f172a' }}>°C</span>
            <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', color: getVitalStatus('temp', vitals.temp).color, background: '#f8fafc', border: `1px solid ${getVitalStatus('temp', vitals.temp).color}`, fontWeight: 600 }}>
              {getVitalStatus('temp', vitals.temp).label}
            </span>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="lab-metric-row">
          <div className="lab-name">
            <strong style={{ color: '#0f172a' }}>Respiratory Rate</strong>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: 12 - 20 /min</div>
          </div>
          <div className="lab-value-group">
            <input
              type="number"
              className="lab-input-number"
              value={vitals.respRate}
              onChange={(e) => handleVitalChange('respRate', e.target.value)}
            />
            <span style={{ fontSize: '0.78rem', color: '#0f172a' }}>/min</span>
            <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', color: getVitalStatus('respRate', vitals.respRate).color, background: '#f8fafc', border: `1px solid ${getVitalStatus('respRate', vitals.respRate).color}`, fontWeight: 600 }}>
              {getVitalStatus('respRate', vitals.respRate).label}
            </span>
          </div>
        </div>

        {/* Inflammatory Biomarkers */}
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Gauge size={14} style={{ color: '#0284c7' }} /> Inflammatory & Pulmonary Biomarkers:
        </div>

        <div className="lab-metric-row">
          <div className="lab-name">
            <strong style={{ color: '#0f172a' }}>WBC (Leukocytes)</strong>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: 4.5 - 11.0 k/µL</div>
          </div>
          <div className="lab-value-group">
            <input
              type="number"
              step="0.1"
              className="lab-input-number"
              value={panel.wbc}
              onChange={(e) => handlePanelChange('wbc', e.target.value)}
            />
            <span style={{ fontSize: '0.78rem', color: '#0f172a' }}>k/µL</span>
          </div>
        </div>

        <div className="lab-metric-row">
          <div className="lab-name">
            <strong style={{ color: '#0f172a' }}>C-Reactive Protein (CRP)</strong>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: &lt; 5.0 mg/L</div>
          </div>
          <div className="lab-value-group">
            <input
              type="number"
              step="0.1"
              className="lab-input-number"
              value={panel.crp}
              onChange={(e) => handlePanelChange('crp', e.target.value)}
            />
            <span style={{ fontSize: '0.78rem', color: '#0f172a' }}>mg/L</span>
          </div>
        </div>

        <div className="lab-metric-row">
          <div className="lab-name">
            <strong style={{ color: '#0f172a' }}>FEV1/FVC Ratio (Spirometry)</strong>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: &gt; 70%</div>
          </div>
          <div className="lab-value-group">
            <input
              type="number"
              className="lab-input-number"
              value={panel.fev1Fvc}
              onChange={(e) => handlePanelChange('fev1Fvc', e.target.value)}
            />
            <span style={{ fontSize: '0.78rem', color: '#0f172a' }}>%</span>
          </div>
        </div>
      </div>

      {/* Model Status */}
      <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Cpu size={12} /> Model: {SYSTEM_MODELS.labModel.name}
        </span>
        <span className="mono" style={{ color: '#0284c7', fontWeight: 600 }}>Z-Score Normalized</span>
      </div>
    </div>
  );
}
