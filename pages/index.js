import { useState, useEffect } from 'react';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [playerError, setPlayerError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading channels...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('📊 Channels loaded:', data);
      
      if (data.success) {
        setChannels(data.data);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const playChannel = (channel) => {
    setSelectedChannel(channel);
    setPlayerError(false);
    console.log('🎯 Playing channel:', channel.streamUrl);
  };

  const closePlayer = () => {
    setSelectedChannel(null);
    setPlayerError(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeError = () => {
    console.error('❌ Iframe load error');
    setPlayerError(true);
  };

  const handleIframeLoad = () => {
    console.log('✅ Iframe loaded successfully');
    setPlayerError(false);
  };

  // Group channels by category
  const groupedChannels = channels.reduce((groups, channel) => {
    const category = channel.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(channel);
    return groups;
  }, {});

  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: 1400, 
      margin: '0 auto', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Main Container */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        {/* HEADER */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
          padding: '30px 20px', 
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.8em', fontWeight: 'bold' }}>
            🏏 StreamCrichd Player
          </h1>
          <p style={{ margin: '0 0 20px 0', fontSize: '1.3em', opacity: 0.9 }}>
            Live Sports Streaming • Direct Embed URLs
          </p>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '12px 24px', 
            borderRadius: 25,
            display: 'inline-block',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              ⚠️ Educational Purpose Only • Live Stream Testing
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: 30 }}>
          {/* REFRESH BUTTON */}
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <button 
              onClick={fetchChannels} 
              disabled={loading}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
            >
              {loading ? '🔄 Loading Channels...' : '🔄 Refresh Channel List'}
            </button>
          </div>

          {/* CHANNEL PLAYER */}
          {selectedChannel && (
            <div style={{
              position: isFullscreen ? 'fixed' : 'relative',
              top: 0,
              left: 0,
              right: 0,
              bottom: isFullscreen ? 0 : 'auto',
              background: isFullscreen ? 'black' : 'white',
              zIndex: 1000,
              marginBottom: isFullscreen ? 0 : 30,
              borderRadius: isFullscreen ? 0 : 15,
              boxShadow: isFullscreen ? 'none' : '0 15px 50px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: isFullscreen ? 'black' : 'white',
                height: isFullscreen ? '100vh' : '70vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                {/* Player Header */}
                {!isFullscreen && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: 20,
                    borderBottom: '2px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      <img 
                        src={selectedChannel.icon} 
                        alt={selectedChannel.title}
                        style={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: 12,
                          objectFit: 'cover',
                          border: '3px solid #e5e7eb'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTIiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMiA5YTMgMyAwIDAgMSAzLTNoMTRhMyAzIDAgMCAxIDMgM3Y2YTMgMyAwIDAgMS0zIDNINWEzIDMgMCAwIDEtMy0zVjlaIi8+CjxwYXRoIGQ9Im0xNSAxMy0zLTMtMyAzIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                        }}
                      />
                      <div>
                        <h2 style={{ color: '#1f2937', margin: '0 0 8px 0', fontSize: '1.6em' }}>
                          {selectedChannel.title}
                        </h2>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ 
                            background: '#10b981', 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: 20,
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {selectedChannel.category}
                          </span>
                          <span style={{ 
                            background: '#f59e0b', 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: 20,
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {selectedChannel.quality}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            🔴 Live Stream
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button 
                        onClick={toggleFullscreen}
                        style={{
                          padding: '12px 24px',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        {isFullscreen ? '📱 Exit' : '📺 Fullscreen'}
                      </button>
                      <button 
                        onClick={closePlayer}
                        style={{
                          padding: '12px 24px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕ Close
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Stream Player */}
                <div style={{ 
                  flex: 1, 
                  background: '#000',
                  position: 'relative'
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
                      padding: 40
                    }}>
                      <div style={{ fontSize: '80px', marginBottom: 20 }}>❌</div>
                      <h3 style={{ color: '#ef4444', marginBottom: 15, fontSize: '1.8em' }}>Stream Error</h3>
                      <p style={{ marginBottom: 10, fontSize: '16px', color: '#d1d5db' }}>
                        Could not load the stream from:
                      </p>
                      <div style={{ 
                        background: '#374151', 
                        padding: 15, 
                        borderRadius: 8,
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        wordBreak: 'break-all',
                        marginBottom: 30,
                        maxWidth: '80%'
                      }}>
                        {selectedChannel.streamUrl}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                          onClick={() => window.open(selectedChannel.streamUrl, '_blank')}
                          style={{
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          🌐 Open Direct Link
                        </button>
                        <button 
                          onClick={closePlayer}
                          style={{
                            padding: '12px 24px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          ← Back to Channels
                        </button>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={selectedChannel.streamUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      allowFullScreen
                      allow="encrypted-media; autoplay; fullscreen"
                      onError={handleIframeError}
                      onLoad={handleIframeLoad}
                      title={`Live Stream: ${selectedChannel.title}`}
                    />
                  )}
                </div>

                {/* Fullscreen Close Button */}
                {isFullscreen && (
                  <button 
                    onClick={closePlayer}
                    style={{
                      position: 'absolute',
                      top: 25,
                      right: 25,
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 60,
                      height: 60,
                      cursor: 'pointer',
                      fontSize: '24px',
                      zIndex: 1001,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CHANNELS GALLERY */}
          {!selectedChannel && (
            <div>
              {/* Statistics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20, 
                marginBottom: 40
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  padding: '25px 20px', 
                  borderRadius: 15,
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 8 }}>
                    {channels.length}
                  </div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>Total Channels</div>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                  padding: '25px 20px', 
                  borderRadius: 15,
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 8 }}>
                    {Object.keys(groupedChannels).length}
                  </div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>Countries</div>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                  padding: '25px 20px', 
                  borderRadius: 15,
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 8 }}>
                    HD
                  </div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>Stream Quality</div>
                </div>
              </div>

              {/* Channels by Category */}
              {Object.keys(groupedChannels).map(category => (
                <div key={category} style={{ marginBottom: 50 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 25,
                    padding: '20px 25px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 15,
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  }}>
                    <h2 style={{ margin: 0, fontSize: '1.8em', flex: 1, fontWeight: 'bold' }}>
                      🌍 {category} Sports
                    </h2>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      padding: '8px 16px', 
                      borderRadius: 20,
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {groupedChannels[category].length} channels
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: 25 
                  }}>
                    {groupedChannels[category].map((channel) => (
                      <div 
                        key={channel.id}
                        style={{ 
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          padding: 25, 
                          borderRadius: 15,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={() => playChannel(channel)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                          e.currentTarget.style.borderColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        {/* Live Badge */}
                        <div style={{
                          position: 'absolute',
                          top: 15,
                          right: 15,
                          background: '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: '12px',
                          fontWeight: 'bold',
                          animation: 'pulse 2s infinite',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                        }}>
                          🔴 LIVE
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                          <img 
                            src={channel.icon} 
                            alt={channel.title}
                            style={{ 
                              width: 70, 
                              height: 70, 
                              borderRadius: 15,
                              objectFit: 'cover',
                              marginRight: 20,
                              border: '3px solid #f3f4f6',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiByeD0iMTUiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSIxOCIgeT0iMTgiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMiA5YTMgMyAwIDAgMSAzLTNoMTRhMyAzIDAgMCAxIDMgM3Y2YTMgMyAwIDAgMS0zIDNINWEzIDMgMCAwIDEtMy0zVjlaIi8+CjxwYXRoIGQ9Im0xNSAxMy0zLTMtMyAzIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ 
                              color: '#1f2937', 
                              margin: '0 0 8px 0', 
                              fontSize: '1.3em',
                              fontWeight: 'bold',
                              lineHeight: 1.2
                            }}>
                              {channel.title}
                            </h3>
                            <div style={{ 
                              background: '#f3f4f6', 
                              color: '#6b7280', 
                              padding: '4px 12px', 
                              borderRadius: 12,
                              fontSize: '12px',
                              display: 'inline-block',
                              fontWeight: 'bold'
                            }}>
                              {channel.category}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ 
                          background: '#f0fdf4', 
                          padding: 12, 
                          borderRadius: 10,
                          border: '2px solid #dcfce7',
                          marginBottom: 15
                        }}>
                          <div style={{ 
                            color: '#059669', 
                            fontSize: '13px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                          }}>
                            <span>🎯</span>
                            <span>Direct Stream Available</span>
                            <span>🎯</span>
                          </div>
                        </div>
                        
                        <div style={{ 
                          padding: 12, 
                          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
                          borderRadius: 10,
                          textAlign: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}>
                          ▶️ Click to Watch Live
                        </div>

                        {/* URL Preview */}
                        <div style={{ 
                          marginTop: 12,
                          padding: 8,
                          background: '#f8fafc',
                          borderRadius: 8,
                          fontSize: '10px',
                          color: '#6b7280',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          border: '1px solid #e5e7eb'
                        }}>
                          {channel.streamUrl.replace('https://', '')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {channels.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
                  <div style={{ fontSize: '100px', marginBottom: 30 }}>📺</div>
                  <h3 style={{ marginBottom: 20, fontSize: '2em' }}>No Channels Loaded</h3>
                  <p style={{ marginBottom: 15, fontSize: '18px' }}>
                    Click "Refresh Channel List" to load live sports channels
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Direct stream URLs from streamcrichd.com will be loaded
                  </p>
                </div>
              )}
              
              {loading && (
                <div style={{ textAlign: 'center', padding: 80 }}>
                  <div style={{ fontSize: '80px', marginBottom: 30 }}>🔍</div>
                  <h3 style={{ marginBottom: 20, fontSize: '2em' }}>Loading Channels</h3>
                  <p style={{ marginBottom: 30, fontSize: '18px' }}>
                    Fetching live sports streams from streamcrichd.com...
                  </p>
                  <div style={{ 
                    width: '400px', 
                    height: '8px', 
                    background: '#e5e7eb', 
                    borderRadius: '4px',
                    margin: '0 auto 40px auto',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563eb, #8b5cf6, #ec4899)',
                      animation: 'loading 1.5s infinite'
                    }}></div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Loading: Channel list • Stream URLs • Icons • Categories...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ 
          background: '#1f2937', 
          color: 'white', 
          padding: '30px 20px', 
          textAlign: 'center',
          borderTop: '2px solid #374151'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>
            🏏 StreamCrichd Player • Educational Purpose Only
          </p>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
            Direct embed streams from streamcrichd.com • Built with Next.js
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}