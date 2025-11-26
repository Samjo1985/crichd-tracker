// SIMPLE API - GUARANTEED TO WORK
export default function handler(req, res) {
  console.log('🎯 API CALLED SUCCESSFULLY!');
  
  const matches = [
    {
      title: "🇮🇳 India vs Pakistan - LIVE",
      url: "https://v1.crichd.tv",
      relativeUrl: "/live"
    },
    {
      title: "🇦🇺 Australia vs England - ODI",
      url: "https://v1.crichd.tv", 
      relativeUrl: "/cricket"
    },
    {
      title: "🇧🇩 Bangladesh vs Sri Lanka - T20",
      url: "https://v1.crichd.tv",
      relativeUrl: "/stream"
    }
  ];

  res.status(200).json({
    success: true,
    data: matches,
    message: "🎉 API IS WORKING!",
    timestamp: new Date().toISOString()
  });
}