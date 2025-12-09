export default function PresentaionBuilder() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1b1e 0%, #17181c 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}>
          Presentation Builder
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888',
        }}>
          Presentation Builder content coming soon...
        </p>
      </div>
    </div>
  );
}
