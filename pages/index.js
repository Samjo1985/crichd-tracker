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
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMiA