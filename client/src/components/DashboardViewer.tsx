import { useEffect, useRef } from 'react';

interface DashboardViewerProps {
  htmlCode: string;
}

export function DashboardViewer({ htmlCode }: DashboardViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !htmlCode) return;

    const iframe = iframeRef.current;
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    iframe.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [htmlCode]);

  if (!htmlCode) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        background: 'linear-gradient(135deg, #1a1b1e 0%, #17181c 100%)',
        border: '2px dashed #2A2C33',
        borderRadius: '16px',
        padding: '48px 24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>
            No Dashboard Yet
          </h3>
          <p style={{ marginTop: '12px', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
            Ask the AI to create a dashboard similar to the apps in /apps directory. 
            It will generate a complete HTML dashboard with maps, charts, and data visualizations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Dashboard Preview"
      style={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        minHeight: '700px',
        border: '1px solid #2A2C33',
        borderRadius: '16px',
        background: '#0f172a',
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
