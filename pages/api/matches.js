export default function handler(req, res) {
  console.log('🎯 API CALLED SUCCESSFULLY!');
  
  const matches = [
    {
      id: 1,
      title: "🇮🇳 India vs Pakistan - LIVE Test",
      m3u8Url: "https://example-stream.com/stream1/master.m3u8",
      backupUrl: "https://backup-stream.com/stream1.m3u8",
      quality: "HD"
    },
    {
      id: 2, 
      title: "🇦🇺 Australia vs England - ODI",
      m3u8Url: "https://example-stream.com/stream2/master.m3u8", 
      backupUrl: "https://backup-stream.com/stream2.m3u8",
      quality: "HD"
    },
    {
      id: 3,
      title: "🇧🇩 Bangladesh vs Sri Lanka - T20", 
      m3u8Url: "https://example-stream.com/stream3/master.m3u8",
      backupUrl: "https://backup-stream.com/stream3.m3u8",
      quality: "720p"
    },
    {
      id: 4,
      title: "🇳🇿 New Zealand vs South Africa",
      m3u8Url: "https://example-stream.com/stream4/master.m3u8",
      backupUrl: "https://backup-stream.com/stream4.m3u8", 
      quality: "HD"
    }
  ];

  res.status(200).json({
    success: true,
    data: matches,
    message: "🎉 M3U8 Streams Available!",
    timestamp: new Date().toISOString()
  });
}
