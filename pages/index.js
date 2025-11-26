import { useState, useEffect } from 'react';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      console.log('Fetching matches from API...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load matches on page load
  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🏏 Cricket Matches Tracker</h1>
      <p>Educational Purpose Only</p>
      
      <button onClick={fetchMatches} disabled={loading}>
        {loading ? '🔄 Loading...' : '🔄 Refresh Matches'}
      </button>
      
      <h2>Live Matches ({matches.length})</h2>
      
      {matches.map((match, index) => (
        <div key={index} style={{ 
          border: '2px solid #0070f3', 
          padding: 15, 
          margin: 10, 
          borderRadius: 10,
          background: '#f0f8ff'
        }}>
          <h3 style={{ color: '#0070f3', margin: 0 }}>
            {match.title}
          </h3>
          <a 
            href={match.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 5,
              marginTop: 10
            }}
          >
            🌐 Watch Live Stream
          </a>
        </div>
      ))}
      
      {matches.length === 0 && !loading && (
        <p>No matches currently available</p>
      )}
    </div>
  );
}