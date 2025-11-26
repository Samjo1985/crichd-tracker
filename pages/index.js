import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [playerError, setPlayerError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching M3U8 streams...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('📊 Streams found:', data);
      
      if (data.success) {
        setStreams(data.data);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const playStream = (stream) => {
    setSelectedStream(stream);
    setPlayerError(false);
    setIsPlaying(false);
  };

  const closePlayer = () => {
    setSelectedStream(null);
    setPlayerError(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setIsPlaying(true);
  };

  const handleVideoError = (e) => {
    console.error('❌ Video error:', e);
    setPlayerError(true);
    setIsPlaying(false);
  };

  // Build the stream URL (with proxy if needed)
  const getStreamUrl = (stream) => {
    if (stream.requiresProxy) {
      return `/api/proxy-stream?url=${encodeURIComponent(stream.m3u8Url)}`;
    }
    return stream.m3u8Url;
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb', textAlign: 'center' }}>🏏 M3U8 Stream Player</h1>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>Direct M3U8 Stream Playback</p>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#ef4444', background: '#fef2f2', padding: 10, borderRadius: 5 }}>
        <strong>⚠️ Educational Purpose Only - M3U8 Stream Testing</strong>
      </p>
      
      {/* M3U8 VIDEO PLAYER */}
      {selectedStream && (
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
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.5em' }}>
                  📺 {selectedStream.title}
                </h2>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
                  🎯 M3U8 Stream • {selectedStream.quality}
                </p>
              </div>
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
                  fontSize: '18px'
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
                  <h3 style={{ color: '#ef4444', marginBottom: 10 }}>Stream Playback Failed</h3>
                  <p style={{ marginBottom: 20 }}>The M3U8 stream cannot be played due to:</p>
                  <ul style={{ textAlign: 'left', marginBottom: 20, color: '#d1d5db' }}>
                    <li>Authentication requirements</li>
                    <li>CORS restrictions</li>
                    <li>Expired tokens</li>
                    <li>Geo-blocking</li>
                  </ul>
                  
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
                    ← Back to Stream List
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  key={getStreamUrl(selectedStream)} // Force re-render when URL changes
                  controls
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 8
                  }}
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={getStreamUrl(selectedStream)} type="application/x-mpegURL" />
                  Your browser does not support M3U8 streams.
                </video>
              )}
            </div>
            
            {/* Stream Info */}
            <div style={{ marginTop: 15, color: '#9ca3af', fontSize: '14px' }}>
              <div style={{ 
                background: '#374151', 
                padding: 10, 
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                <strong>M3U8 URL:</strong><br />
                {selectedStream.m3u8Url}
              </div>
              
              <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                <span>Status: 
                  <strong style={{ 
                    color: isPlaying ? '#10b981' : playerError ? '#ef4444' : '#f59e0b',
                    marginLeft: 5
                  }}>
                    {isPlaying ? '▶️ Playing' : playerError ? '❌ Error' : '⏳ Loading'}
                  </strong>
                </span>
                <span>Proxy: {selectedStream.requiresProxy ? '✅ Enabled' : '❌ Disabled'}</span>
                <span>Quality: {selectedStream.quality}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAMS LIST */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={fetchStreams} 
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
          {loading ? '🔄 Scanning for M3U8...' : '🔄 Find M3U8 Streams'}
        </button>
      </div>
      
      <h2 style={{ color: '#374151' }}>Available M3U8 Streams ({streams.length})</h2>
      
      {streams.length > 0 ? (
        <div style={{ display: 'grid', gap: 15 }}>
          {streams.map((stream) => (
            <div key={stream.id} style={{ 
              border: '2px solid #10b981', 
              padding: 20, 
              borderRadius: 12,
              background: '#f0fdf4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#059669', margin: '0 0 8px 0' }}>
                  {stream.title}
                  <span style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: 10,
                    marginLeft: 10
                  }}>
                    M3U8
                  </span>
                </h3>
                <div style={{ 
                  background: '#dcfce7', 
                  padding: 8, 
                  borderRadius: 6,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  color: '#065f46',
                  marginBottom: 8
                }}>
                  {stream.m3u8Url.substring(0, 80)}...
                </div>
                <div style={{ display: 'flex', gap: 15, fontSize: '14px', color: '#059669' }}>
                  <span>📺 {stream.quality}</span>
                  <span>🔐 {stream.requiresProxy ? 'Proxy Required' : 'Direct'}</span>
                  <span>🏷️ {stream.source || 'auto-detected'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => playStream(stream)}
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
                ▶️ Play M3U8
              </button>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: 20 }}>🔍</div>
            <h3>No M3U8 Streams Found</h3>
            <p>Click "Find M3U8 Streams" to scan for available streams</p>
            <p style={{ fontSize: '14px', marginTop: 10 }}>
              The scanner looks for M3U8 URLs in website code
            </p>
          </div>
        )
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '48px', marginBottom: 20 }}>🕸️</div>
          <h3>Scanning Websites</h3>
          <p>Looking for M3U8 stream URLs...</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Analyzing JavaScript, video tags, and data attributes
          </p>
        </div>
      )}

      {/* Technical Info */}
      <div style={{ 
        marginTop: 40, 
        padding: 20, 
        background: '#f8fafc', 
        borderRadius: 12,
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ color: '#374151' }}>🔧 Technical Information</h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          This system automatically scans for M3U8 streams and uses a proxy to handle 
          authentication headers and CORS restrictions. The proxy adds necessary headers 
          like Origin, Referer, and User-Agent to access protected streams.
        </p>
        <div style={{ 
          background: '#1f2937', 
          color: '#d1d5db', 
          padding: 15, 
          borderRadius: 8,
          fontSize: '12px',
          fontFamily: 'monospace',
          marginTop: 10
        }}>
          Headers Added: Origin, Referer, Accept, User-Agent
        </div>
      </div>
    </div>
  );
}
