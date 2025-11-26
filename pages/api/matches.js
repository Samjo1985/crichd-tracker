import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🕸️ Fetching channel directory...');
    const channels = await getChannelsWithStreams();
    
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({
      success: true,
      data: channels,
      total: channels.length,
      lastUpdated: new Date().toISOString(),
      message: `Found ${channels.length} live channels`
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback with direct stream URLs based on the pattern you found
    const fallbackChannels = getFallbackChannels();
    
    res.status(200).json({
      success: true,
      data: fallbackChannels,
      total: fallbackChannels.length,
      lastUpdated: new Date().toISOString(),
      message: "Using direct stream URLs",
      error: error.message
    });
  }
}

async function getChannelsWithStreams() {
  const baseUrl = 'https://profamouslife.com';
  
  const axiosConfig = {
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
  };

  try {
    // Get the main directory
    const response = await axios.get(baseUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    
    const channels = [];
    let channelId = 1;

    // Extract channels from directory
    $('.channel-list .channel a').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.find('.ch-name').text().trim();
      const icon = $link.find('img.icon').attr('src');
      
      if (href && title) {
        const channelName = extractChannelNameFromUrl(href);
        const streamUrl = `https://streamcrichd.com/update/${channelName}.php`;
        
        const fullIconUrl = icon.startsWith('./') ? `${baseUrl}${icon.substring(1)}` : 
                           icon.startsWith('/') ? `${baseUrl}${icon}` : 
                           icon.startsWith('http') ? icon : `${baseUrl}/${icon}`;
        
        channels.push({
          id: channelId++,
          title: title,
          icon: fullIconUrl,
          channelName: channelName,
          streamUrl: streamUrl,
          embedUrl: streamUrl, // Direct embed URL
          type: "iframe",
          category: getCategoryFromTitle(title),
          quality: "HD",
          source: "streamcrichd.com",
          isLive: true
        });
        
        console.log(`📺 Channel: ${title} -> ${streamUrl}`);
      }
    });

    return channels;
    
  } catch (error) {
    console.error('Scraping failed, using fallback:', error.message);
    return getFallbackChannels();
  }
}

function extractChannelNameFromUrl(url) {
  // Extract channel name from URL like "./channel/willow-sports.html"
  const match = url.match(/\/([a-z-]+)\.html$/);
  if (match) {
    return match[1].replace('-', '');
  }
  return url.split('/').pop().replace('.html', '').replace('-', '');
}

function getCategoryFromTitle(title) {
  const categories = {
    'Willow': 'USA',
    'Star Sports': 'India', 
    'T Sports': 'Bangladesh',
    'PTV': 'Pakistan',
    'Sky Sports': 'UK',
    'Fox': 'Australia',
    'Super Sports': 'South Africa',
    'Ten Sports': 'Pakistan',
    'GTV': 'Bangladesh',
    'Astra': 'Middle East'
  };
  
  for (const [key, value] of Object.entries(categories)) {
    if (title.includes(key)) return value;
  }
  return 'International';
}

function getFallbackChannels() {
  // Direct stream URLs based on the pattern you discovered
  return [
    {
      id: 1,
      title: "Willow Cricket",
      icon: "https://profamouslife.com/icons/willow-sports.png",
      channelName: "willowcricket",
      streamUrl: "https://streamcrichd.com/update/willowcricket.php",
      embedUrl: "https://streamcrichd.com/update/willowcricket.php",
      type: "iframe",
      category: "USA",
      quality: "HD",
      source: "streamcrichd.com",
      isLive: true
    },
    {
      id: 2,
      title: "Willow Sports",
      icon: "https://profamouslife.com/icons/willow-sports.png", 
      channelName: "willowsports",
      streamUrl: "https://streamcrichd.com/update/willowsports.php",
      embedUrl: "https://streamcrichd.com/update/willowsports.php",
      type: "iframe",
      category: "USA",
      quality: "HD",
      source: "streamcrichd.com",
      isLive: true
    },
    {
      id: 3,
      title: "Star Sports 1",
      icon: "https://profamouslife.com/icons/STAR Sports 1.png",
      channelName: "starsports1",
      streamUrl: "https://streamcrichd.com/update/starsports1.php",
      embedUrl: "https://streamcrichd.com/update/starsports1.php",
      type: "iframe",
      category: "India",
      quality: "HD", 
      source: "streamcrichd.com",
      isLive: true
    },
    {
      id: 4,
      title: "Star Sports 1 Hindi",
      icon: "https://profamouslife.com/icons/STAR Sports 1.png",
      channelName: "starsports1hindi",
      streamUrl: "https://streamcrichd.com/update/starsports1hindi.php",
      embedUrl: "https://streamcrichd.com/update/starsports1hindi.php",
      type: "iframe",
      category: "India",
      quality: "HD",
      source: "streamcrichd.com", 
      isLive: true
    },
    {
      id: 5,
      title: "Sky Sports",
      icon: "https://profamouslife.com/icons/sky-sports.png",
      channelName: "skysports",
      streamUrl: "https://streamcrichd.com/update/skysports.php",
      embedUrl: "https://streamcrichd.com/update/skysports.php",
      type: "iframe",
      category: "UK",
      quality: "HD",
      source: "streamcrichd.com",
      isLive: true
    },
    {
      id: 6,
      title: "PTV Sports",
      icon: "https://profamouslife.com/icons/pvt-sports.png",
      channelName: "ptvsports",
      streamUrl: "https://streamcrichd.com/update/ptvsports.php",
      embedUrl: "https://streamcrichd.com/update/ptvsports.php",
      type: "iframe",
      category: "Pakistan",
      quality: "HD",
      source: "streamcrichd.com",
      isLive: true
    },
    {
      id: 7,
      title: "T Sports",
      icon: "https://profamouslife.com/icons/tsports.png",
      channelName: "tsports",
      streamUrl: "https://streamcrichd.com/update/tsports.php",
      embedUrl: "https://streamcrichd.com/update/tsports.php",
      type: "iframe",
      category: "Bangladesh",
      quality: "HD",
      source: "streamcrichd.com",
      isLive: true
    }
  ];
}