import { useState, useEffect } from 'react';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [playerError, setPlayerError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState({ current: 0, total: 0 });

  const fetchChannels = async () => {
    setLoading(true);
    setScrapingProgress({ current: 0, total: 0 });
    
    try {
      console.log('🔄 Starting stream scraping...');
      const response = await fetch('/api/matches');
      const data = await response.json();
      console.log('📊 Scraping completed:', data);
      
      if (data.success) {
        setChannels(data.data);
        
        // Update progress
        if (data.data.length > 0) {
          setScrapingProgress({ 
            current: data.data.length, 
            total: data.data.length 
          });
        }
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const playChannel = (channel) => {
    if (!channel.hasStream) {
      alert('No stream URL found for this channel. The scraping might have failed.');
      return;
    }
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

  const retryScraping = () => {
    fetchChannels();
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

  const workingChannels = channels.filter(c => c.hasStream).length;
  const totalChannels = channels.length;

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
          color: 'white',
          position: 'relative'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em', fontWeight: 'bold' }}>
            🏏 Real Stream Scraper
          </h1>
          <p style={{ margin: '0 0 20px 0', fontSize: '1.2em', opacity: 0.9 }}>
            Live Sports • Actual Stream Extraction
          </p>
          
          {/* Scraping Stats */}
          {loading && (
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '15px', 
              borderRadius: 15,
              marginTop: 15,
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '14px', marginBottom: 8, fontWeight: 'bold' }}>
                🔍 Scraping Channel Pages...
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: 'rgba(255,255,255,0.3)', 
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: scrapingProgress.total > 0 ? `${(scrapingProgress.current / scrapingProgress.total) * 100}%` : '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{ fontSize: '12px', marginTop: 8, opacity: 0.8 }}>
                Scanning for real stream URLs...
              </div>
            </div>
          )}
          
          {!loading && channels.length > 0 && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.2)', 
              padding: '12px 20px', 
              borderRadius: 15,
              marginTop: 15,
              display: 'inline-block',
              border: '2px solid rgba(16, 185, 129, 0.3)'
            }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                ✅ Found {workingChannels} working streams • ⚠️ Educational Use Only
              </p>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ padding: 30 }}>
          {/* CONTROLS */}
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={fetchChannels} 
                disabled={loading}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
              >
                {loading ? '🔄 Scraping...' : '🔍 Rescrape Streams'}
              </button>
              
              {channels.length > 0 && (
                <button 
                  onClick={retryScraping}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                  }}
                >
                  🔄 Retry Failed
                </button>
              )}
            </div>
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
                    borderBottom: '2px solid #f3f4f6',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      <img 
                        src={selectedChannel.icon} 
                        alt={selectedChannel.title}
                        style={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: '3px solid #e5e7eb'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMiA5YTMgMyAwIDAgMSAzLTNoMTRhMyAzIDAgMCAxIDMgM3Y2YTMgMyAwIDAgMS0zIDNINWEzIDMgMCAwIDEtMy0zVjlaIi8+CjxwYXRoIGQ9Im0xNSAxMy0zLTMtMyAzIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                        }}
                      />
                      <div>
                        <h2 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '1.4em' }}>
                          {selectedChannel.title}
                        </h2>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ 
                            background: '#10b981', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: 6,
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {selectedChannel.category}
                          </span>
                          <span style={{ 
                            background: '#8b5cf6', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: 6,
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {selectedChannel.type}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>
                            🔴 Real Stream
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
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        {isFullscreen ? '📱 Exit' : '📺 Fullscreen'}
                      </button>
                      <button 
                        onClick={closePlayer}
                        style={{
                          padding: '10px 20px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '13px',
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
                      padding: 30
                    }}>
                      <div style={{ fontSize: '60px', marginBottom: 20 }}>❌</div>
                      <h3 style={{ color: '#ef4444', marginBottom: 15, fontSize: '1.4em' }}>Stream Error</h3>
                      <p style={{ marginBottom: 10, fontSize: '14px', color: '#d1d5db' }}>
                        Could not load the scraped stream
                      </p>
                      <div style={{ 
                        background: '#374151', 
                        padding: 12, 
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                        marginBottom: 20,
                        maxWidth: '90%'
                      }}>
                        {selectedChannel.streamUrl}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button 
                          onClick={() => window.open(selectedChannel.streamUrl, '_blank')}
                          style={{
                            padding: '10px 20px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🌐 Open Direct
                        </button>
                        <button 
                          onClick={closePlayer}
                          style={{
                            padding: '10px 20px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          ← Back
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
              {channels.length > 0 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 20, 
                  marginBottom: 40
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    padding: '20px', 
                    borderRadius: 12,
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 5 }}>
                      {workingChannels}
                    </div>
                    <div style={{ fontSize: '14px' }}>Working Streams</div>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    padding: '20px', 
                    borderRadius: 12,
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 5 }}>
                      {Object.keys(groupedChannels).length}
                    </div>
                    <div style={{ fontSize: '14px' }}>Countries</div>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                    padding: '20px', 
                    borderRadius: 12,
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 5 }}>
                      Real
                    </div>
                    <div style={{ fontSize: '14px' }}>Scraped URLs</div>
                  </div>
                </div>
              )}

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
                    <h2 style={{ margin: 0, fontSize: '1.4em', flex: 1, fontWeight: 'bold' }}>
                      🌍 {category}
                    </h2>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      padding: '6px 12px', 
                      borderRadius: 15,
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {groupedChannels[category].length} streams
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
                          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                          cursor: channel.hasStream ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          opacity: channel.hasStream ? 1 : 0.7
                        }}
                        onClick={() => channel.hasStream && playChannel(channel)}
                        onMouseEnter={(e) => {
                          if (channel.hasStream) {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                        }}
                      >
                        {/* Status Badge */}
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: channel.hasStream ? '#10b981' : '#6b7280',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 10,
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {channel.hasStream ? '🔴 LIVE' : '❌ NO STREAM'}
                        </div>
                        
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
                              borderRadius: 8,
                              fontSize: '10px',
                              display: 'inline-block',
                              fontWeight: 'bold'
                            }}>
                              {channel.category} • {channel.type}
                            </div>
                          </div>
                        </div>
                        
                        {channel.hasStream ? (
                          <>
                            <div style={{ 
                              background: '#f0fdf4', 
                              padding: 8, 
                              borderRadius: 8,
                              border: '1px solid #dcfce7',
                              marginBottom: 10
                            }}>
                              <div style={{ 
                                color: '#059669', 
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textAlign: 'center'
                              }}>
                                ✅ Real Scraped Stream
                              </div>
                            </div>
                            
                            <div style={{ 
                              padding: 10, 
                              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
                              borderRadius: 8,
                              textAlign: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              ▶️ Click to Watch Live
                            </div>
                          </>
                        ) : (
                          <div style={{ 
                            padding: 10, 
                            background: '#6b7280', 
                            borderRadius: 8,
                            textAlign: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ❌ Stream Not Found
                          </div>
                        )}

                        {/* URL Preview */}
                        {channel.hasStream && (
                          <div style={{ 
                            marginTop: 10,
                            padding: 6,
                            background: '#f8fafc',
                            borderRadius: 6,
                            fontSize: '9px',
                            color: '#6b7280',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            border: '1px solid #e5e7eb'
                          }}>
                            {channel.streamUrl.replace('https://', '')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {channels.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                  <div style={{ fontSize: '80px', marginBottom: 20 }}>🔍</div>
                  <h3 style={{ marginBottom: 15, fontSize: '1.8em' }}>No Streams Found</h3>
                  <p style={{ marginBottom: 10, fontSize: '16px' }}>
                    Click "Rescrape Streams" to extract real stream URLs
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                    The system will visit each channel page and find actual stream iframes
                  </p>
                </div>
              )}
              
              {loading && (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <div style={{ fontSize: '60px', marginBottom: 20 }}>🕸️</div>
                  <h3 style={{ marginBottom: 15, fontSize: '1.6em' }}>Scraping in Progress</h3>
                  <p style={{ marginBottom: 20, fontSize: '16px' }}>
                    Visiting channel pages and extracting real stream URLs...
                  </p>
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
                    This may take 20-30 seconds as we scan each channel page...
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
          padding: '25px 20px', 
          textAlign: 'center',
          borderTop: '2px solid #374151'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>
            🏏 Real Stream Scraper • Actual URL Extraction
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
            Visits each channel page to find real stream iframes • Educational Use Only
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}