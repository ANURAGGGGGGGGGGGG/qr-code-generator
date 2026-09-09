import React, { useEffect, useState, useCallback, useMemo } from 'react';

const QrGenerator = () => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [qr, setQr] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  const downloadBtnContent = useMemo(() => {
    return isDownloading ? (
      <>
        <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="1" opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" strokeWidth="3"/>
        </svg>
        Downloading...
      </>
    ) : 'Download PNG';
  }, [isDownloading]);

  const toggleTheme = () => {
    const next = !isDarkTheme;
    setIsDarkTheme(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setIsDarkTheme(saved === 'dark');
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    if (text.trim()) {
      const encoded = encodeURIComponent(text);
      const bg = color.substring(1);
      const fg = isDarkTheme ? 'ffffff' : '000000';
      setQr(`https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&bgcolor=${bg}&forecolor=${fg}`);
      setIsValid(true);
    } else {
      setQr('');
      setIsValid(false);
    }
  }, [text, color, size, isDarkTheme]);

  const handleDownload = async () => {
    if (!qr || isDownloading) return;
    try {
      setIsDownloading(true);
      const res = await fetch(qr);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QRCode-${text.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Downloaded successfully!');
    } catch {
      showToast('Download failed. Try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qr).then(() => {
      showToast('QR link copied!');
    }).catch(() => {
      showToast('Failed to copy');
    });
  };

  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewOpen]);

  return (
    <div className="page">
      <div className="container">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
        >
          {isDarkTheme ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div className="header">
          <h1 className="title">QR Code Generator</h1>
          <p className="subtitle">Create a QR code for any text or URL in seconds</p>
        </div>

        <div className="input-section">
          <div className="input-row">
            <div className="input-wrapper">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a URL or type any text..."
                aria-label="QR code content input"
                className="text-input"
              />
            </div>
            <div className="color-picker-wrapper">
              <label className="color-label">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Select background color"
                className="color-picker"
              />
            </div>
          </div>
          <button className="generate-btn">
            {isValid ? 'Update' : 'Generate'}
          </button>
        </div>

        <div className="options-card">
          <div className="options-row">
            <div className="option-group">
              <label className="option-label">Background</label>
              <div className="color-picker-wrapper-lg">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Select background color"
                  className="color-picker"
                  style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }}
                />
              </div>
              <div
                className="color-swatch"
                style={{ backgroundColor: color }}
              />
            </div>
            <div className="option-group size-group">
              <label className="option-label" htmlFor="dim">
                Size &middot; {size}px
              </label>
              <input
                type="range"
                id="dim"
                min="200"
                max="600"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                aria-label="Adjust QR code size"
                className="size-slider"
              />
              <div className="size-labels">
                <span>200</span>
                <span>600</span>
              </div>
            </div>
          </div>
        </div>

        {isValid && (
          <div key={qr} className="qr-card">
            <div className="qr-card-body">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="qr-image-btn"
                aria-label="Open full-size QR code preview"
              >
                <img src={qr} alt="Generated QR Code" className="qr-image" onError={() => setIsValid(false)} />
              </button>
            </div>
            <div className="qr-actions">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-primary"
              >
                {downloadBtnContent}
              </button>
              <button
                onClick={handleCopy}
                className="btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        )}

        {isValid && previewOpen && (
          <div
            className="modal-backdrop"
            data-open={previewOpen}
            onClick={() => setPreviewOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Full-size QR code preview"
              className="modal-card"
              data-open={previewOpen}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
                className="modal-close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div className="modal-image">
                <img src={qr} alt="Full-size generated QR Code" />
              </div>
              <div className="modal-actions">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn-primary"
                >
                  {downloadBtnContent}
                </button>
                <button
                  onClick={handleCopy}
                  className="btn-secondary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`toast ${toast ? 'visible' : ''}`}
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
