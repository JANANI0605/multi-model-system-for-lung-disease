import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function PatientAiChat({ patient }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${patient.name}! I am your PulseFusion Personal AI Health Assistant. I have analyzed your medical data (Lab results, Chest X-ray scan, and Clinical notes). How can I help explain your health summary today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Contextual Q&A Generator based on patient's own data
  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const condition = patient.primaryCondition;
    const topPred = patient.fusionResults.diseasePredictions[0];

    if (q.includes('spo2') || q.includes('oxygen') || q.includes('lab') || q.includes('test')) {
      return `Your SpO2 oxygen saturation level is currently ${patient.labData.vitals.spo2}% (Normal reference range is 95-100%). Your body temperature is ${patient.labData.vitals.temp}°C and CRP (inflammatory marker) is ${patient.labData.bloodPanel.crp} mg/L. These biomarkers contribute to your overall diagnostic assessment for ${condition}.`;
    } 
    
    if (q.includes('xray') || q.includes('x-ray') || q.includes('scan') || q.includes('chest')) {
      return `Your Chest X-ray radiograph shows: "${patient.xrayData.description}". Primary key findings detected include: ${patient.xrayData.findingTags.join(', ')}.`;
    }

    if (q.includes('diagnosis') || q.includes('condition') || q.includes('disease') || q.includes('what do i have')) {
      return `Based on joint multimodal AI fusion of your symptoms, lab markers, and X-ray vision, your primary finding is "${condition}" with an AI confidence of ${topPred.probability.toFixed(1)}% (${patient.severity} Risk Status).`;
    }

    if (q.includes('treatment') || q.includes('cure') || q.includes('do next') || q.includes('recommend') || q.includes('medication')) {
      if (condition.includes('Pneumonia')) {
        return `Recommended next steps for ${condition}: 1) Consult your attending pulmonologist for targeted antibiotic therapy. 2) Supplemental oxygen support if SpO2 drops below 92%. 3) Rest, adequate hydration, and repeat blood inflammatory markers (CRP/WBC) in 48 hours.`;
      } else if (condition.includes('COPD')) {
        return `Recommended next steps for COPD Exacerbation: 1) Inhaled bronchodilators and corticosteroid therapy as prescribed. 2) Oxygen therapy with target SpO2 88-92%. 3) Pulmonary rehabilitation and smoking cessation guidance.`;
      } else if (condition.includes('Tuberculosis')) {
        return `Recommended next steps for Pulmonary TB: 1) Immediate Sputum Acid-Fast Bacilli (AFB) smear and GeneXpert PCR confirmation. 2) Isolation precautions and multi-drug antitubercular therapy (RIPE regimen).`;
      } else if (condition.includes('Pneumothorax')) {
        return `EMERGENCY ALERT: Tension Pneumothorax requires immediate clinical intervention (needle decompression / chest tube placement) to restore negative intrapleural pressure.`;
      } else {
        return `Your diagnostic indicators are within normal parameters. Continue standard routine health checkups, balanced diet, and regular exercise!`;
      }
    }

    return `For ${patient.name} (MRN: ${patient.mrn}), your current primary condition is assessed as ${condition} (${topPred.probability.toFixed(1)}% joint confidence). Always discuss detailed medical choices with your licensed healthcare team.`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputQuery('');

    // Simulate AI response delay
    setTimeout(() => {
      const aiReply = generateResponse(userText);
      setMessages([...newMessages, { sender: 'ai', text: aiReply }]);
    }, 400);
  };

  const presetQuestions = [
    `Explain my SpO2 & lab results`,
    `What does my Chest X-ray show?`,
    `What are my recommended treatment steps?`,
    `How confident is the AI in my diagnosis?`
  ];

  return (
    <div className="ai-chat-card">
      <div className="ai-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="ai-bot-avatar">
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              AI Health Assistant — Personalized for {patient.name}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Bound to MRN: {patient.mrn} | Private AI Medical Consultation
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6, 182, 212, 0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.72rem', color: 'var(--primary-cyan)' }}>
          <Shield size={13} />
          <span>Patient-Specific Context Active</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}>
            <div className={`chat-avatar ${msg.sender === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
              {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
            </div>
            <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Question Chips */}
      <div className="chat-preset-chips">
        {presetQuestions.map((q, idx) => (
          <button key={idx} type="button" className="chat-chip-btn" onClick={() => {
            setInputQuery(q);
          }}>
            <HelpCircle size={12} /> {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input 
          type="text" 
          placeholder={`Ask about ${patient.name}'s diagnosis, lab test values, or treatment...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '10px' }}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
