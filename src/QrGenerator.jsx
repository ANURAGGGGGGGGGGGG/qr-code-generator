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
        <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-md mx-auto py-12 px-6">
        <button
          className="btn-press fixed top-4 left-4 p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors duration-150 ease-out"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
        >
          <span className="block transition-transform duration-200 ease-out">
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
          </span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            QR Code Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a QR code for any text or URL in seconds
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-150 ease-out"
              />
            </div>
            <div className="relative shrink-0">
              <label className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase text-center mb-1">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Select background color"
                className="inline-block h-10 w-10 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 shadow-sm cursor-pointer"
              />
            </div>
          </div>
          <button className="btn-press mt-4 w-full px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-600 dark:disabled:hover:bg-emerald-500 disabled:pointer-events-none transition-colors duration-150 ease-out shadow-sm hover:shadow-md">
            {isValid ? 'Update' : 'Generate'}
          </button>
        </div>

        <div className="mb-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Background</label>
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-emerald-300 dark:border-gray-700 shadow-sm">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Select background color"
                  className="h-10 w-10 rounded-full overflow-hidden"
                />
              </div>
              <div
                className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 transition-colors duration-150"
                style={{ backgroundColor: color }}
              />
            </div>
            <div className="flex flex-col items-center gap-3 flex-1 max-w-[180px]">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="dim">
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
                className="w-full"
              />
              <div className="flex justify-between w-full text-[10px] text-gray-400 dark:text-gray-500">
                <span>200</span>
                <span>600</span>
              </div>
            </div>
          </div>
        </div>

        {isValid && (
          <div key={qr} className="animate-qr-in rounded-2xl overflow-hidden shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-800">
            <div className="bg-white dark:bg-slate-900 p-6">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="btn-press group relative block w-full cursor-zoom-in"
                aria-label="Open full-size QR code preview"
              >
                <img src={qr} alt="Generated QR Code" className="w-full h-64 object-contain transition-transform duration-200 ease-out group-hover:scale-[1.01]" onError={() => setIsValid(false)} />
              </button>
            </div>
            <div className="p-4 flex justify-center gap-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-150 ease-out shadow-sm hover:shadow-md"
              >
                {downloadBtnContent}
              </button>
              <button
                onClick={handleCopy}
                className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ease-out"
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

        {isValid && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm p-6 pt-[12vh]"
            data-open={previewOpen}
            onClick={() => setPreviewOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Full-size QR code preview"
              className="modal-card relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              data-open={previewOpen}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
                className="btn-press absolute top-3 right-3 z-10 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ease-out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div className="bg-white dark:bg-slate-900 p-8 flex items-center justify-center">
                <img src={qr} alt="Full-size generated QR Code" className="max-h-[60vh] object-contain" />
              </div>
            <div className="p-4 flex justify-center gap-3 bg-gray-50 dark:bg-slate-900/60 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-150 ease-out shadow-sm hover:shadow-md"
                >
                  {downloadBtnContent}
                </button>
                <button
                  onClick={handleCopy}
                  className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ease-out"
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
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg transition-all duration-200 ease-out ${
            toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
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
