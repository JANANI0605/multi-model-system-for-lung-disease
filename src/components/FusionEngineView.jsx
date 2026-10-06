import React from 'react';
import { Cpu, ArrowRight, Zap, Network, Sliders, Shield } from 'lucide-react';
import { SYSTEM_MODELS } from '../data/clinicalData';

export default function FusionEngineView({ fusionResults, activePatient }) {
  const defaultContributions = [
    { name: "Clinical Symptoms", weight: 35.0, color: "#8b5cf6" },
    { name: "Lab & Vitals Biomarkers", weight: 30.0, color: "#06b6d4" },
    { name: "Chest X-Ray Vision", weight: 35.0, color: "#3b82f6" }
  ];
  const contributions = fusionResults?.modalityContributions || activePatient?.fusionResults?.modalityContributions || defaultContributions;

  return (
    <div className="fusion-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} style={{ color: '#0284c7' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Multimodal Health Diagnostic Engine</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 600 }}>
              Joint Health Synthesis
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Combines patient symptom notes, laboratory measurements, and chest X-ray scans into a unified diagnostic assessment.
          </p>
        </div>

        <div style={{ fontSize: '0.78rem', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 700 }}>
          3 Healthcare Modalities • Integrated AI Analysis
        </div>
      </div>

      {/* Feature Flow Visualizer */}
      <div className="fusion-flow-visualizer">
        {/* Modality Node 1 */}
        <div className="modality-node" style={{ borderColor: '#bae6fd' }}>
          <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700 }}>MODALITY 1</div>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Clinical Symptom Intake</strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Symptom & History Profile</span>
          <div style={{ marginTop: '0.4rem', height: '6px', width: '100%', background: '#ccfbf1', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${contributions[1]?.weight || 30}%`, height: '100%', background: '#0d9488' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>Modality Weight: {contributions[1]?.weight}%</span>
        </div>

        <ArrowRight size={20} style={{ color: '#0284c7', opacity: 0.7 }} />

        {/* Modality Node 2 */}
        <div className="modality-node" style={{ borderColor: '#bae6fd' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>MODALITY 2</div>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Lab & Vital Biomarkers</strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Laboratory Measurements</span>
          <div style={{ marginTop: '0.4rem', height: '6px', width: '100%', background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${contributions[2]?.weight || 25}%`, height: '100%', background: '#0284c7' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>Modality Weight: {contributions[2]?.weight}%</span>
        </div>

        <ArrowRight size={20} style={{ color: '#0284c7', opacity: 0.7 }} />

        {/* Modality Node 3 */}
        <div className="modality-node" style={{ borderColor: '#bae6fd' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>MODALITY 3</div>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Chest Radiograph Scan</strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>X-Ray Imaging Findings</span>
          <div style={{ marginTop: '0.4rem', height: '6px', width: '100%', background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${contributions[0]?.weight || 45}%`, height: '100%', background: '#0284c7' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>Modality Weight: {contributions[0]?.weight}%</span>
        </div>

        <ArrowRight size={24} style={{ color: '#0284c7' }} />

        {/* Central Unified Core Node */}
        <div className="fusion-center-core" style={{ background: 'radial-gradient(circle, #e0f2fe 0%, #ccfbf1 80%)', borderColor: '#0284c7' }}>
          <Network size={28} style={{ color: '#0284c7' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', textAlign: 'center' }}>UNIFIED ASSESSMENT</span>
          <span style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 700 }}>Integrated Profile</span>
        </div>
      </div>

      {/* Modality Contribution Percentage Breakdown */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={14} style={{ color: '#0284c7' }} /> Modality Feature Weighting & Diagnostic Contribution:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {contributions.map((c, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                <strong style={{ color: '#0284c7' }}>{c.weight}%</strong>
              </div>
              <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.weight}%`, background: '#0284c7', borderRadius: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
