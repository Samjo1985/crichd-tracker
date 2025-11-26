import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [playerError, setPlayerError] = useState(false);
  const videoRef = useRef(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const playStream = (match) => {
    setSelectedMatch(match);
    setPlayerError(false);
  };

  const closePlayer = () => {
    setSelectedMatch(null);
    setPlayerError(false);
    // Stop video playback
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };

  const handleVideoError = () => {
    setPlayerError(true);
    console.error('Video playback failed');
  };

  const tryBackupStream = () => {
    if (selectedMatch && selectedMatch.backupUrl) {
      setPlayerError(false);
      // This will trigger a re-render with backup URL
      const updatedMatch = { ...selectedMatch, m3u8Url: selectedMatch.backupUrl };
      setSelectedMatch(updatedMatch);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb', textAlign: 'center' }}>🏏 Crichd M3U8 Streams</h1>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>Watch Live Cricket Streams via M3U8</p>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#ef4444', background: '#fef2f2', padding: 10, borderRadius: 5 }}>
        <strong>⚠️ Educational Purpose Only - Demo M3U8 URLs</strong>
      </p>
      
      {/* M3U8 VIDEO PLAYER */}
      {selectedMatch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          padding: 20,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: 12,
            padding: 20,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%'
          }}>
            {/* Player Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.5em' }}>
                📺 {selectedMatch.title}
              </h2>
              <button 
                onClick={closePlayer}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Video Player */}
            <div style={{ 
              flex: 1, 
              background: '#000', 
              borderRadius: 8,
              position: 'relative',
              minHeight: 400
            }}>
              {playerError ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: 'white',
                  textAlign: 'center',
                  padding: 20
                }}>
                  <div style={{ fontSize: '48px', marginBottom: 20 }}>❌</div>
                  <h3 style={{ color: '#ef4444', marginBottom: 10 }}>Stream Unavailable</h3>
                  <p style={{ marginBottom: 20 }}>The M3U8 stream cannot be played. This could be due to:</p>
                  <ul style={{ textAlign: 'left', marginBottom: 20 }}>
                    <li>Stream URL not accessible</li>
                    <li>CORS restrictions</li>
                    <li>Stream offline</li>
                  </ul>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    {selectedMatch.backupUrl && (
                      <button 
                        onClick={tryBackupStream}
                        style={{
                          padding: '10px 20px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}
                      >
                        🔄 Try Backup Stream
                      </button>
                    )}
                    <button 
                      onClick={closePlayer}
                      style={{
                        padding: '10px 20px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to List
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  key={selectedMatch.m3u8Url} // Force re-render when URL changes
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8
                  }}
                  onError={handleVideoError}
                >
                  <source src={selectedMatch.m3u8Url} type="application/x-mpegURL" />
                  <source src={selectedMatch.m3u8Url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            {/* Player Info */}
            <div style={{ marginTop: 15, color: '#9ca3af', fontSize: '14px' }}>
              <p>Stream Quality: <strong>{selectedMatch.quality}</strong></p>
              <p>Format: <strong>M3U8 (HLS)</strong></p>
              {!playerError && (
                <p>Status: <strong style={{ color: '#10b981' }}>▶️ Playing</strong></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MATCHES LIST */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={fetchMatches} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh Streams'}
        </button>
      </div>
      
      <h2 style={{ color: '#374151' }}>Available M3U8 Streams ({matches.length})</h2>
      
      {matches.length > 0 ? (
        <div style={{ display: 'grid', gap: 15 }}>
          {matches.map((match) => (
            <div key={match.id} style={{ 
              border: '2px solid #dbeafe', 
              padding: 20, 
              borderRadius: 12,
              background: '#f0f9ff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1e40af', margin: '0 0 5px 0' }}>
                  {match.title}
                </h3>
                <div style={{ display: 'flex', gap: 15, fontSize: '14px', color: '#6b7280' }}>
                  <span>📺 {match.quality}</span>
                  <span>🔗 M3U8 Format</span>
                </div>
              </div>
              
              <button 
                onClick={() => playStream(match)}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                ▶️ Play Stream
              </button>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <p>No M3U8 streams currently available</p>
            <p>Click "Refresh Streams" to try again</p>
          </div>
        )
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Loading M3U8 streams...</p>
        </div>
      )}
    </div>
  );
}
