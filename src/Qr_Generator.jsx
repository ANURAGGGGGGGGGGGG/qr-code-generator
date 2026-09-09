import React, { useEffect, useState } from 'react';
import './index.css';

const QrGenerator = () => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(200);
  const [qr, setQr] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Theme handling
  const toggleTheme = () => {
    const newTheme = !isDarkTheme ? 'dark' : 'light';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkTheme(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // QR Generation
  useEffect(() => {
    if (text.trim()) {
      const encodedText = encodeURIComponent(text);
      const bgColor = color.substring(1);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedText}&size=${size}x${size}&bgcolor=${bgColor}`;
      setQr(qrUrl);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [text, color, size]);

  // Download handler
  const handleDownload = async () => {
    if (!qr || isDownloading) return;
    
    try {
      setIsDownloading(true);
      const response = await fetch(qr);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Create safe filename
      const filename = `QRCode-${text.substring(0, 15).replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setIsValid(false);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container">
      <button 
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
      >
        {isDarkTheme ? '🌞' : '🌙'}
      </button>

      <h1>QR Code Generator</h1>
      
      <div className="text">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL"
          aria-label="QR code content input"
        />
        <button 
          onClick={() => document.getElementById('download-section')?.scrollIntoView({ behavior: 'smooth' })}
          disabled={!isValid}
        >
          {isValid ? 'Update QR Code' : 'Generate QR Code'}
        </button>
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="bg">Background Color</label>
          <input
            type="color"
            id="bg"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Select background color"
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="dim">Size ({size}px)</label>
          <input
            type="range"
            id="dim"
            min="200"
            max="600"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Adjust QR code size"
          />
        </div>
      </div>

      {isValid && (
        <div className="qr-result" id="download-section">
          <img 
            src={qr} 
            alt="Generated QR Code" 
            onError={() => setIsValid(false)}
          />
          <button 
            onClick={handleDownload}
            className="download-button"
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download QR Code'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QrGenerator;