import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Tag, CheckCircle2, Bot } from 'lucide-react';
import { SYSTEM_MODELS } from '../data/clinicalData';

export default function ModalityTextPanel({ textData, onChangeText }) {
  const [notes, setNotes] = useState(textData?.clinicalNotes || '');
  const [extracted, setExtracted] = useState(textData?.extractedEntities || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setNotes(textData?.clinicalNotes || '');
    setExtracted(textData?.extractedEntities || []);
  }, [textData]);

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    onChangeText(val);
  };

  const handleReanalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="modality-card">
      <div className="modality-header">
        <div className="modality-title">
          <div className="modality-icon-badge icon-text">
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ color: '#0f172a' }}>Modality 1: Clinical Text</h3>
            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Symptoms & Observational Notes</p>
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#059669', border: '1px solid #a7f3d0' }} className="mono">
          [Vector Analysis Active]
        </span>
      </div>

      {/* Chief Complaint Brief */}
      <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', borderLeft: '3px solid #0d9488', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>CHIEF COMPLAINT</div>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>"{textData?.chiefComplaint || 'Self-reported symptoms'}"</p>
      </div>

      {/* Editable Clinical Observations Area */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Clinical Progress & Exam Note:</label>
          <button 
            onClick={handleReanalyze} 
            style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
          >
            <Sparkles size={12} />
            {isAnalyzing ? 'Extracting Symptoms...' : 'Analyze Symptoms'}
          </button>
        </div>
        <textarea
          className="clinical-textarea"
          value={notes}
          onChange={handleNotesChange}
          placeholder="Type clinical observations, symptoms, physical exam findings..."
        />
      </div>

      {/* Extracted Clinical Entities */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Tag size={14} style={{ color: '#0284c7' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Extracted Clinical Symptoms:</span>
        </div>

        <div className="entities-wrap">
          {(extracted || []).map((ent, idx) => (
            <span key={idx} className={`entity-chip chip-${ent.severity || 'medium'}`}>
              <CheckCircle2 size={10} />
              <strong>{ent.category || 'Symptom'}:</strong> {ent.text || ent.symptom}
            </span>
          ))}
        </div>
      </div>

      {/* Model Status Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Bot size={12} /> Clinical Engine Active
        </span>
        <span style={{ color: '#0284c7', fontWeight: 600 }}>Clinical Text Analysis Active</span>
      </div>
    </div>
  );
}
