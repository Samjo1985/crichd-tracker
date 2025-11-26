import { useState, useEffect } from 'react';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [playerError, setPlayerError] = useState(false);

  const fetchChannels = async () => {
    setLoading(true);
    setChannels([]);
    
    try {
      console.log('🔄 Starting real URL scraping...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('📊 Scraping results:', data);
      
      if (data.success) {
        setChannels(data.data);
      } else {
        alert('Scraping failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const playChannel = (channel) => {
    setSelectedChannel(channel);
    setPlayerError(false);
    console.log('🎯 Playing:', channel.streamUrl);
  };

  const closePlayer = () => {
    setSelectedChannel(null);
    setPlayerError(false);
  };

  const handleIframeError = () => {
    console.error('❌ Iframe load error');
    setPlayerError(true);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2563eb' }}>🔍 Real URL Scraper Test</h1>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>Actually visits each page and extracts real stream URLs</p>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={fetchChannels} 
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '🔄 Scraping Real URLs...' : '🔍 Scrape Real URLs'}
        </button>
      </div>

      {/* Results */}
      <div>
        <h2>Scraping Results: {channels.length} channels found</h2>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>🕸️ Visiting each channel page and extracting real stream URLs...</p>
            <p>This may take 30+ seconds as we visit each page individually</p>
          </div>
        )}

        {channels.map(channel => (
          <div key={channel.id} style={{ 
            margin: '10px 0', 
            padding: 15, 
            border: '1px solid #ddd',
            borderRadius: 8,
            background: channel.hasStream ? '#f0fdf4' : '#fef2f2'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: channel.hasStream ? '#059669' : '#dc2626' }}>
                  {channel.title} 
                  <span style={{ 
                    marginLeft: 10, 
                    fontSize: '12px', 
                    background: channel.hasStream ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 10
                  }}>
                    {channel.hasStream ? '✅ REAL URL FOUND' : '❌ NO STREAM'}
                  </span>
                </h3>
                {channel.streamUrl && (
                  <div style={{ 
                    marginTop: 5, 
                    padding: 8, 
                    background: '#1f2937', 
                    color: 'white',
                    borderRadius: 4,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    📺 {channel.streamUrl}
                  </div>
                )}
              </div>
              
              {channel.hasStream && (
                <button 
                  onClick={() => playChannel(channel)}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  ▶️ Play
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Player */}
      {selectedChannel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            maxWidth: 1000,
            margin: '20px auto',
            position: 'relative'
          }}>
            <button 
              onClick={closePlayer}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            
            <h2>{selectedChannel.title}</h2>
            
            {playerError ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#ef4444' }}>❌ Stream failed to load</p>
                <p>URL: {selectedChannel.streamUrl}</p>
              </div>
            ) : (
              <iframe
                src={selectedChannel.streamUrl}
                style={{
                  width: '100%',
                  height: '500px',
                  border: 'none',
                  borderRadius: 8
                }}
                allowFullScreen
                onError={handleIframeError}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}