import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Eye, Sliders, Upload, Layers, Maximize2, Crosshair, Sparkles } from 'lucide-react';
import { SYSTEM_MODELS } from '../data/clinicalData';

export default function ModalityXrayPanel({ xrayData, onUpdateXray }) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  
  const canvasRef = useRef(null);

  // Draw radiograph & Grad-CAM heatmap on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Apply Filter settings
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(100%)' : ''}`;

    if (customImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        if (showHeatmap) drawGradCamOverlay(ctx, width, height);
      };
      img.src = customImage;
    } else {
      drawProceduralXray(ctx, width, height, xrayData.imageType);
      ctx.filter = 'none'; // reset filter for heatmap drawing
      if (showHeatmap) {
        drawGradCamOverlay(ctx, width, height, xrayData.heatmapCoords);
      }
    }
  }, [xrayData, showHeatmap, brightness, contrast, isInverted, customImage]);

  // Procedural chest X-ray renderer
  const drawProceduralXray = (ctx, w, h, type) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w/2);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#020617';

    // Right lung
    ctx.beginPath();
    ctx.ellipse(w * 0.33, h * 0.45, w * 0.16, h * 0.32, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Left lung
    ctx.beginPath();
    ctx.ellipse(w * 0.67, h * 0.45, w * 0.16, h * 0.32, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Cardiac Silhouette
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(w * 0.54, h * 0.55, w * 0.13, h * 0.18, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Spine & Trachea
    ctx.fillStyle = '#64748b';
    ctx.fillRect(w * 0.48, h * 0.1, w * 0.04, h * 0.8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.49, h * 0.12, w * 0.02, h * 0.35);

    // Rib cage structure lines
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      const yOffset = h * 0.22 + i * (h * 0.08);
      ctx.beginPath();
      ctx.arc(w * 0.25, yOffset, w * 0.18, -Math.PI * 0.4, Math.PI * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.75, yOffset, w * 0.18, Math.PI * 0.7, Math.PI * 1.4);
      ctx.stroke();
    }

    if (type === 'Pneumonia') {
      const opacityGrad = ctx.createRadialGradient(w * 0.35, h * 0.65, 10, w * 0.35, h * 0.65, 55);
      opacityGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      opacityGrad.addColorStop(0.6, 'rgba(203, 213, 225, 0.5)');
      opacityGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = opacityGrad;
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.65, 55, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'Tuberculosis') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.26, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
    } else if (type === 'Pneumothorax') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.75, h * 0.2);
      ctx.quadraticCurveTo(w * 0.72, h * 0.5, w * 0.74, h * 0.8);
      ctx.stroke();
    } else if (type === 'COPD') {
      ctx.fillStyle = '#020617';
      ctx.fillRect(w * 0.15, h * 0.7, w * 0.7, h * 0.15);
    }
  };

  const drawGradCamOverlay = (ctx, w, h, coords = { x: 50, y: 50, radius: 25 }) => {
    const cx = (coords.x / 100) * w;
    const cy = (coords.y / 100) * h;
    const r = (coords.radius / 100) * w;

    const heatGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
    heatGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.65)');
    heatGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
    heatGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('GRAD-CAM AI FOCUS', cx - r, cy - r - 4);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modality-card">
      <div className="modality-header">
        <div className="modality-title">
          <div className="modality-icon-badge icon-xray">
            <ImageIcon size={18} />
          </div>
          <div>
            <h3 style={{ color: '#0f172a' }}>Modality 3: Chest X-Ray</h3>
            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>PA Radiograph & Grad-CAM Heatmap</p>
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }} className="mono">
          [1 x 1024 Map]
        </span>
      </div>

      {/* Main Medical Viewport */}
      <div className="xray-viewport-container">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="xray-canvas-layer"
        />

        {/* Heatmap Toggle Badge Overlay */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 600 }}>
            DICOM Standard PA
          </span>
          {showHeatmap && (
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Sparkles size={10} /> Grad-CAM Active
            </span>
          )}
        </div>

        {/* Upload Custom Image Button overlay */}
        <label style={{ position: 'absolute', bottom: 10, right: 10, background: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 600 }}>
          <Upload size={12} />
          {customImage ? 'Change Image' : 'Upload X-Ray'}
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Radiologist Finding Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {xrayData.findingTags.map((tag, idx) => (
          <span key={idx} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f8fafc', border: '1px solid #bae6fd', color: '#0284c7', fontWeight: 600 }}>
            <Crosshair size={10} style={{ display: 'inline', marginRight: '4px' }} />
            {tag}
          </span>
        ))}
      </div>

      {/* Image Manipulation Controls */}
      <div className="xray-controls">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="btn-toggle-heatmap"
          style={{ background: showHeatmap ? '#0284c7' : '#ffffff', color: showHeatmap ? '#ffffff' : '#0284c7', border: '1px solid #bae6fd' }}
        >
          <Layers size={14} />
          {showHeatmap ? 'Hide Heatmap' : 'Show Grad-CAM'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => setIsInverted(!isInverted)}
            style={{ background: isInverted ? '#0284c7' : '#ffffff', border: '1px solid #cbd5e1', color: isInverted ? '#ffffff' : '#0f172a', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Invert
          </button>
          <button
            onClick={() => { setBrightness(100); setContrast(100); setIsInverted(false); setCustomImage(null); }}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Model Info */}
      <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ImageIcon size={12} /> Model: {SYSTEM_MODELS.visionModel.name}
        </span>
        <span className="mono" style={{ color: '#0284c7', fontWeight: 600 }}>Resolution: 512x512</span>
      </div>
    </div>
  );
}
