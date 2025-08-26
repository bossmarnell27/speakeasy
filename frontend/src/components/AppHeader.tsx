export function AppHeader() {
  return (
    <header style={{
      textAlign: 'center',
      padding: '20px 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(118, 75, 162, 0.3)'
    }}>
      <h1 style={{
        fontFamily: '"Comfortaa", cursive',
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#ffffff',
        margin: '0',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '1px'
      }}>
        SpeakEasy
      </h1>
      <p style={{
        fontFamily: '"Comfortaa", cursive',
        fontSize: '1rem',
        fontWeight: '300',
        color: '#f0f0f0',
        margin: '5px 0 0 0',
        opacity: '0.9'
      }}>
        Master the Art of Public Speaking
      </p>
    </header>
  );
}