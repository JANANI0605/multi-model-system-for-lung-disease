import React from 'react';
import { Cpu, ArrowRight, Zap, Network, Sliders, Shield } from 'lucide-react';
import { SYSTEM_MODELS } from '../data/clinicalData';

export default function FusionEngineView({ fusionResults, activePatient }) {
  const contributions = fusionResults.modalityContributions;

  return (
    <div className="fusion-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} style={{ color: '#0284c7' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Multimodal Feature Fusion Engine</h2>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 600 }}>
              Cross-Attention Fusion Layer
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Late feature fusion combining text, lab measurements, and image embeddings into a joint 512-D latent representation space.
          </p>
        </div>

        <div className="mono" style={{ fontSize: '0.78rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 600 }}>
          Latent Dim: 512 | Loss Function: Multi-Label BCE + Focal Loss
        </div>
      </div>

      {/* Feature Vector Flow Animation Diagram */}
      <div className="fusion-flow-visualizer">
        {/* Modality Node 1 */}
        <div className="modality-node" style={{ borderColor: '#bae6fd' }}>
          <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700 }}>MODALITY 1</div>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>BioBERT Text Vector</strong>
          <span className="mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>[1 x 768] Token Map</span>
          <div style={{ marginTop: '0.4rem', height: '6px', width: '100%', background: '#ccfbf1', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${contributions[1]?.weight || 30}%`, height: '100%', background: '#0d9488' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#475569' }}>Attention Weight: {contributions[1]?.weight}%</span>
        </div>

        <ArrowRight size={20} style={{ color: '#0284c7', opacity: 0.7 }} />

        {/* Modality Node 2 */}
        <div className="modality-node" style={{ borderColor: '#bae6fd' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>MODALITY 2</div>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>TabTransformer Vector</strong>
          <span className="mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>[1 x 128] Biomarkers</span>
          <div style={{ marginTop: '0.4rem', height: '6px', width: '100%', background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${contributions[2]?.weight || 25}%`, height: '100%', background: '#0284c7' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#475569' }}>Attention Weight: {contributions[2]?.weight}%</span>
        </div>

        <ArrowRight size={20} style={{ color: '#0284c7', opacity: 0.7 }} />

        {/* Modality Node 3 */}
        <div className="modality-node" style={{ borderColor: '#bae6fd' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>MODALITY 3</div>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Swin-Vision Feature Map</strong>
          <span className="mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>[1 x 1024] Spatial Features</span>
          <div style={{ marginTop: '0.4rem', height: '6px', width: '100%', background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${contributions[0]?.weight || 45}%`, height: '100%', background: '#0284c7' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#475569' }}>Attention Weight: {contributions[0]?.weight}%</span>
        </div>

        <ArrowRight size={24} style={{ color: '#0284c7' }} />

        {/* Central Unified Fusion Core Node */}
        <div className="fusion-center-core" style={{ background: 'radial-gradient(circle, #e0f2fe 0%, #ccfbf1 80%)', borderColor: '#0284c7' }}>
          <Network size={28} style={{ color: '#0284c7' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>FUSED EMBEDDING</span>
          <span className="mono" style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 700 }}>[512 Vector]</span>
        </div>
      </div>

      {/* Modality Contribution Percentage Breakdown */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={14} style={{ color: '#0284c7' }} /> Modality Feature Weighting & Cross-Attention Attribution:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {contributions.map((c, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
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
