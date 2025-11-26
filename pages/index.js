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
      console.log('🔄 Fetching channels...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('📊 Channels found:', data);
      
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

  const getStreamUrl = (channel) => {
    if (channel.iframeUrl) {
      return channel.iframeUrl.startsWith('//') ? `https:${channel.iframeUrl}` : channel.iframeUrl;
    }
    return channel.streamUrl;
  };

  const openOriginalPage = () => {
    if (selectedChannel?.channelUrl) {
      window.open(selectedChannel.channelUrl, '_blank');
    }
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
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={{ color: '#2563eb', margin: '0 0 10px 0', fontSize: '2.5em' }}>🏏 Hasib IP TV</h1>
        <p style={{ color: '#6b7280', fontSize: '1.2em', margin: '0 0 20px 0' }}>Live Sports Channels</p>
        <div style={{ 
          background: '#fef2f2', 
          padding: '12px 20px', 
          borderRadius: 10,
          display: 'inline-block',
          border: '2px solid #fecaca'
        }}>
          <p style={{ color: '#dc2626', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
            ⚠️ Educational Purpose Only - Live Stream Testing
          </p>
        </div>
      </div>

      {/* REFRESH BUTTON */}
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <button 
          onClick={fetchChannels} 
          disabled={loading}
          style={{
            padding: '15px 30px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
          }}
        >
          {loading ? '🔄 Scanning Channels...' : '🔄 Refresh Channels'}
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
          padding: isFullscreen ? 0 : 20,
          marginBottom: isFullscreen ? 0 : 30,
          border: isFullscreen ? 'none' : '2px solid #e5e7eb',
          borderRadius: isFullscreen ? 0 : 15,
          boxShadow: isFullscreen ? 'none' : '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: isFullscreen ? 'black' : 'white',
            borderRadius: isFullscreen ? 0 : 15,
            padding: isFullscreen ? 0 : 20,
            display: 'flex',
            flexDirection: 'column',
            height: isFullscreen ? '100vh' : '600px',
            position: 'relative'
          }}>
            {/* Player Header */}
            {!isFullscreen && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <img 
                    src={selectedChannel.icon} 
                    alt={selectedChannel.title}
                    style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: 10,
                      objectFit: 'cover',
                      border: '2px solid #e5e7eb'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMiA5YTMgMyAwIDAgMSAzLTNoMTRhMyAzIDAgMCAxIDMgM3Y2YTMgMyAwIDAgMS0zIDNINWEzIDMgMCAwIDEtMy0zVjlaIi8+CjxwYXRoIGQ9Im0xNSAxMy0zLTMtMyAzIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                    }}
                  />
                  <div>
                    <h2 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '1.5em' }}>
                      {selectedChannel.title}
                    </h2>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ 
                        background: '#10b981', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: 20,
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {selectedChannel.category}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        {selectedChannel.hasStream ? '🎯 Live Stream' : '🌐 Web Page'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={toggleFullscreen}
                    style={{
                      padding: '10px 20px',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {isFullscreen ? '📱 Exit Fullscreen' : '📺 Fullscreen'}
                  </button>
                  <button 
                    onClick={closePlayer}
                    style={{
                      padding: '10px 20px',
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
              borderRadius: isFullscreen ? 0 : 10,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {playerError ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  textAlign: 'center',
                  padding: 20
                }}>
                  <div style={{ fontSize: '64px', marginBottom: 20 }}>❌</div>
                  <h3 style={{ color: '#ef4444', marginBottom: 10, fontSize: '1.5em' }}>Stream Unavailable</h3>
                  <p style={{ marginBottom: 20, fontSize: '16px', color: '#d1d5db' }}>
                    Could not load the stream. This might be due to:
                  </p>
                  <ul style={{ textAlign: 'left', marginBottom: 30, color: '#9ca3af', fontSize: '14px' }}>
                    <li>• Ad-blockers blocking the content</li>
                    <li>• Geographic restrictions</li>
                    <li>• Stream being temporarily offline</li>
                    <li>• Network connectivity issues</li>
                  </ul>
                  
                  <div style={{ display: 'flex', gap: 15 }}>
                    <button 
                      onClick={openOriginalPage}
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
                      🌐 Open Original Page
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
              ) : selectedChannel.streamUrl || selectedChannel.iframeUrl ? (
                <iframe
                  src={getStreamUrl(selectedChannel)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: isFullscreen ? 0 : 10
                  }}
                  allowFullScreen
                  allow="encrypted-media; autoplay; fullscreen"
                  onError={handleIframeError}
                  title={`Live Stream: ${selectedChannel.title}`}
                />
              ) : (
                <div style={{ color: 'white', textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: '64px', marginBottom: 20 }}>🌐</div>
                  <h3>Channel Page</h3>
                  <p style={{ marginBottom: 20, color: '#9ca3af' }}>
                    No direct stream URL found for this channel.
                  </p>
                  <button 
                    onClick={openOriginalPage}
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
                    🌐 Open Channel Page
                  </button>
                </div>
              )}
            </div>

            {/* Fullscreen Close Button */}
            {isFullscreen && (
              <button 
                onClick={closePlayer}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  cursor: 'pointer',
                  fontSize: '20px',
                  zIndex: 1001
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
            display: 'flex', 
            justifyContent: 'center', 
            gap: 20, 
            marginBottom: 30,
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '15px 25px', 
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              minWidth: 120
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                {channels.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Channels</div>
            </div>
            <div style={{ 
              background: 'white', 
              padding: '15px 25px', 
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              minWidth: 120
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {channels.filter(c => c.hasStream).length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Live Streams</div>
            </div>
            <div style={{ 
              background: 'white', 
              padding: '15px 25px', 
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              minWidth: 120
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {Object.keys(groupedChannels).length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Countries</div>
            </div>
          </div>

          {/* Channels by Category */}
          {Object.keys(groupedChannels).map(category => (
            <div key={category} style={{ marginBottom: 40 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 20,
                padding: '15px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
                color: 'white'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.5em', flex: 1 }}>
                  🌍 {category} Channels
                </h2>
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '5px 12px', 
                  borderRadius: 20,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {groupedChannels[category].length} channels
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: 20 
              }}>
                {groupedChannels[category].map((channel) => (
                  <div 
                    key={channel.id}
                    style={{ 
                      background: 'white',
                      border: channel.hasStream ? '2px solid #10b981' : '2px solid #e5e7eb',
                      padding: 20, 
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => playChannel(channel)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                  >
                    {/* Live Badge */}
                    {channel.hasStream && (
                      <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 20,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        animation: 'pulse 2s infinite'
                      }}>
                        🔴 LIVE
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                      <img 
                        src={channel.icon} 
                        alt={channel.title}
                        style={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: 10,
                          objectFit: 'cover',
                          marginRight: 15,
                          border: '2px solid #f3f4f6'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMiA5YTMgMyAwIDAgMSAzLTNoMTRhMyAzIDAgMCAxIDMgM3Y2YTMgMyAwIDAgMS0zIDNINWEzIDMgMCAwIDEtMy0zVjlaIi8+CjxwYXRoIGQ9Im0xNSAxMy0zLTMtMyAzIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          color: '#1f2937', 
                          margin: '0 0 5px 0', 
                          fontSize: '1.1em',
                          fontWeight: 'bold'
                        }}>
                          {channel.title}
                        </h3>
                        <div style={{ 
                          background: '#f3f4f6', 
                          color: '#6b7280', 
                          padding: '2px 8px', 
                          borderRadius: 10,
                          fontSize: '11px',
                          display: 'inline-block'
                        }}>
                          {channel.category}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: channel.hasStream ? '#f0fdf4' : '#f8fafc', 
                      padding: 10, 
                      borderRadius: 8,
                      border: `1px solid ${channel.hasStream ? '#dcfce7' : '#e5e7eb'}`,
                      marginBottom: 10
                    }}>
                      <div style={{ 
                        color: channel.hasStream ? '#059669' : '#6b7280', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        {channel.hasStream ? '🎯 Direct Stream Available' : '🌐 Web Page Only'}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: 8, 
                      background: '#2563eb', 
                      borderRadius: 8,
                      textAlign: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ▶️ Click to {channel.hasStream ? 'Watch Live' : 'View Channel'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {channels.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
              <div style={{ fontSize: '80px', marginBottom: 20 }}>📺</div>
              <h3 style={{ marginBottom: 15 }}>No Channels Found</h3>
              <p style={{ marginBottom: 10 }}>Click "Refresh Channels" to scan for available sports channels</p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                The system will automatically discover channels from the streaming website
              </p>
            </div>
          )}
          
          {loading && (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: '64px', marginBottom: 20 }}>🔍</div>
              <h3 style={{ marginBottom: 15 }}>Scanning Streaming Website</h3>
              <p style={{ marginBottom: 20 }}>Discovering channels and extracting streams...</p>
              <div style={{ 
                width: '300px', 
                height: '6px', 
                background: '#e5e7eb', 
                borderRadius: '3px',
                margin: '0 auto 30px auto',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #2563eb, #8b5cf6)',
                  animation: 'loading 1.5s infinite'
                }}></div>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Scanning: Channel directory, Extracting streams, Loading icons...
              </p>
            </div>
          )}
        </div>
      )}

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