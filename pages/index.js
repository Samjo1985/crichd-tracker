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
      console.log('🔄 Fetching streams...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('📊 Streams response:', data);
      
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
    console.log('🎯 Playing stream:', stream);
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
    setPlayerError(false);
  };

  const handleVideoError = (e) => {
    console.error('❌ Video error:', e);
    console.error('Video error details:', videoRef.current?.error);
    setPlayerError(true);
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    console.log('▶️ Video started playing');
    setIsPlaying(true);
    setPlayerError(false);
  };

  // Use HLS.js for better M3U8 support
  const loadHLSPlayer = async (streamUrl) => {
    if (typeof window !== 'undefined' && window.Hls) {
      const video = videoRef.current;
      if (video) {
        const hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(e => {
            console.error('Auto-play failed:', e);
          });
        });
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          console.error('HLS error:', data);
          setPlayerError(true);
        });
      }
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb', textAlign: 'center' }}>🏏 Cricket Stream Player</h1>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>Live M3U8 Stream Playback</p>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#ef4444', background: '#fef2f2', padding: 10, borderRadius: 5 }}>
        <strong>⚠️ Educational Purpose Only - Test Streams</strong>
      </p>
      
      {/* VIDEO PLAYER OVERLAY */}
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
                  <h3 style={{ color: '#ef4444', marginBottom: 10 }}>Stream Unavailable</h3>
                  <p>This test stream might be offline or not accessible.</p>
                  <p style={{ marginBottom: 20, fontSize: '14px', color: '#d1d5db' }}>
                    Try a different stream or check your internet connection.
                  </p>
                  
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
                  key={selectedStream.m3u8Url}
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
                  onPlay={handleVideoPlay}
                  onPlaying={handleVideoPlay}
                >
                  <source src={selectedStream.m3u8Url} type="application/x-mpegURL" />
                  <source src={selectedStream.m3u8Url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            {/* Stream Info */}
            <div style={{ marginTop: 15, color: '#9ca3af', fontSize: '14px' }}>
              <div style={{ 
                background: '#374151', 
                padding: 10, 
                borderRadius: 6,
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                <strong>Stream URL:</strong><br />
                {selectedStream.m3u8Url}
              </div>
              
              <div style={{ display: 'flex', gap: 20, marginTop: 10, alignItems: 'center' }}>
                <span>Status: 
                  <strong style={{ 
                    color: isPlaying ? '#10b981' : playerError ? '#ef4444' : '#f59e0b',
                    marginLeft: 5
                  }}>
                    {isPlaying ? '▶️ Playing' : playerError ? '❌ Error' : '⏳ Loading...'}
                  </strong>
                </span>
                <span>Quality: {selectedStream.quality}</span>
                {!isPlaying && !playerError && (
                  <span style={{ color: '#f59e0b' }}>
                    ⚠️ If stream doesn't play, try a different one
                  </span>
                )}
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
          {loading ? '🔄 Loading Streams...' : '🔄 Load Test Streams'}
        </button>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: 10 }}>
          Click to load publicly available test streams
        </p>
      </div>
      
      <h2 style={{ color: '#374151' }}>Available Streams ({streams.length})</h2>
      
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
                  wordBreak: 'break-all',
                  color: '#065f46',
                  marginBottom: 8
                }}>
                  {stream.m3u8Url}
                </div>
                <div style={{ display: 'flex', gap: 15, fontSize: '14px', color: '#059669' }}>
                  <span>📺 {stream.quality}</span>
                  <span>🔓 Public Test Stream</span>
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
                ▶️ Play Stream
              </button>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: 20 }}>📺</div>
            <h3>No Streams Loaded</h3>
            <p>Click "Load Test Streams" to see available streams</p>
          </div>
        )
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '48px', marginBottom: 20 }}>⏳</div>
          <h3>Loading Streams</h3>
          <p>Fetching available test streams...</p>
        </div>
      )}

      {/* Information Section */}
      <div style={{ 
        marginTop: 40, 
        padding: 20, 
        background: '#f0f9ff', 
        borderRadius: 12,
        border: '2px solid #dbeafe'
      }}>
        <h3 style={{ color: '#1e40af' }}>ℹ️ How This Works</h3>
        <p style={{ color: '#374151' }}>
          This player uses <strong>publicly available test M3U8 streams</strong> to demonstrate 
          the streaming functionality. These are real M3U8 streams that should work in most browsers.
        </p>
        <div style={{ 
          background: '#dbeafe', 
          padding: 15, 
          borderRadius: 8,
          marginTop: 10
        }}>
          <strong>Note:</strong> Some streams may be offline or have limited availability. 
          If one stream doesn't work, try another one from the list.
        </div>
      </div>
    </div>
  );
}
