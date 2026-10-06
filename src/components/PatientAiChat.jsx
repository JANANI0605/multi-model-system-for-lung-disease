import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function PatientAiChat({ patient }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${patient?.name || 'Patient'}! I am your Personal AI Health Assistant. I have analyzed your medical data (Lab results, Chest X-ray scan, and Clinical notes). How can I help explain your health summary today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Contextual Q&A Generator based on patient's own data
  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const condition = patient?.primaryCondition || 'Baseline Respiratory Assessment';
    const topPred = patient?.fusionResults?.diseasePredictions?.[0] || { probability: 95 };

    if (q.includes('spo2') || q.includes('oxygen') || q.includes('lab') || q.includes('test')) {
      const spo2 = patient?.labData?.vitals?.spo2 || 98;
      const temp = patient?.labData?.vitals?.temp || 37.0;
      const crp = patient?.labData?.bloodPanel?.crp || 2.5;
      return `Your SpO2 oxygen saturation level is currently ${spo2}% (Normal reference range is 95-100%). Your body temperature is ${temp}°C and CRP (inflammatory marker) is ${crp} mg/L. These biomarkers contribute to your overall diagnostic assessment for ${condition}.`;
    } 
    
    if (q.includes('xray') || q.includes('x-ray') || q.includes('scan') || q.includes('chest')) {
      const desc = patient?.xrayData?.description || 'Standard thoracic radiograph scan.';
      const tags = patient?.xrayData?.findingTags?.join(', ') || 'No abnormal tags.';
      return `Your Chest X-ray radiograph shows: "${desc}". Primary key findings detected include: ${tags}.`;
    }

    if (q.includes('diagnosis') || q.includes('condition') || q.includes('disease') || q.includes('what do i have')) {
      const prob = topPred.probability ? topPred.probability.toFixed(1) : '95.0';
      return `Based on joint multimodal AI fusion of your symptoms, lab markers, and X-ray vision, your primary finding is "${condition}" with an AI confidence of ${prob}% (${patient?.severity || 'Normal'} Risk Status).`;
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

    const probText = topPred.probability ? topPred.probability.toFixed(1) : '95.0';
    return `For ${patient?.name || 'Patient'}, your current primary condition is assessed as ${condition} (${probText}% joint confidence). Always discuss detailed medical choices with your licensed healthcare team.`;
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              AI Health Assistant — Personalized for {patient?.name || 'Patient'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Personalized AI Health Record Assistant | Private AI Consultation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', padding: '5px 12px', borderRadius: '10px', border: '1px solid #7dd3fc', fontSize: '0.78rem', color: '#0072ce', fontWeight: 700 }}>
          <Shield size={14} />
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
          placeholder={`Ask about ${patient?.name || 'patient'}'s diagnosis, lab values, or treatment...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.35rem', borderRadius: '12px' }}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
