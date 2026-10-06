import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LungAI ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('pulse_fusion_patient_id');
    } catch (e) {
      console.warn('LocalStorage reset error', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: '#ffffff', border: '2px solid #0072ce', padding: '2.75rem 2.5rem', borderRadius: '24px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 50px rgba(0, 114, 206, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <img src="/logo.png" alt="LungAI Logo" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
            
            <h2 style={{ fontSize: '1.5rem', color: '#0c3166', fontWeight: 800, margin: 0 }}>
              Diagnostic Portal Health Active
            </h2>
            
            <p style={{ fontSize: '0.92rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              The application refreshed its state. Click below to instantly return to your diagnostic health portal.
            </p>

            <button 
              onClick={this.handleReset}
              style={{ background: 'linear-gradient(135deg, #0c3166 0%, #0072ce 100%)', color: '#ffffff', border: 'none', padding: '0.9rem 1.75rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 6px 20px rgba(0, 114, 206, 0.3)', width: '100%', marginTop: '0.5rem' }}
            >
              Return to Diagnostic Portal &rarr;
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
