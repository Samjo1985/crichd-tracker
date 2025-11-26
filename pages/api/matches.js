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
    console.log('🕸️ Scraping channel directory...');
    const channels = await scrapeAllChannels();
    
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({
      success: true,
      data: channels,
      total: channels.length,
      lastUpdated: new Date().toISOString(),
      message: `Found ${channels.length} live channels`
    });
    
  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    
    // Fallback sample data based on the HTML structure
    const sampleChannels = [
      {
        id: 1,
        title: "T Sports",
        icon: "./icons/tsports.png",
        channelUrl: "./channel/t-sports.html",
        streamUrl: null,
        type: "sports",
        category: "Bangladesh"
      },
      {
        id: 2,
        title: "Willow Sports", 
        icon: "./icons/willow-sports.png",
        channelUrl: "./channel/willow-sports.html",
        streamUrl: null,
        type: "sports", 
        category: "USA"
      },
      {
        id: 3,
        title: "Star Sports 1",
        icon: "./icons/STAR Sports 1.png",
        channelUrl: "./channel/star-sports-1.html", 
        streamUrl: null,
        type: "sports",
        category: "India"
      }
    ];
    
    res.status(200).json({
      success: true,
      data: sampleChannels,
      total: sampleChannels.length,
      lastUpdated: new Date().toISOString(),
      message: "Using sample channel data",
      error: error.message
    });
  }
}

async function scrapeAllChannels() {
  const baseUrl = 'https://profamouslife.com'; // The site you found
  
  const axiosConfig = {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/'
    }
  };

  try {
    console.log('📡 Fetching main page...');
    const mainResponse = await axios.get(baseUrl, axiosConfig);
    const $main = cheerio.load(mainResponse.data);
    
    const channels = [];
    let channelId = 1;

    // Extract all channels from the main page
    $main('.channel-list .channel a').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.find('.ch-name').text().trim();
      const icon = $link.find('img.icon').attr('src');
      
      if (href && title) {
        const fullChannelUrl = href.startsWith('./') ? `${baseUrl}${href.substring(1)}` : 
                              href.startsWith('/') ? `${baseUrl}${href}` : 
                              href.startsWith('http') ? href : `${baseUrl}/${href}`;
        
        const fullIconUrl = icon.startsWith('./') ? `${baseUrl}${icon.substring(1)}` : 
                           icon.startsWith('/') ? `${baseUrl}${icon}` : 
                           icon.startsWith('http') ? icon : `${baseUrl}/${icon}`;
        
        channels.push({
          id: channelId++,
          title: title,
          icon: fullIconUrl,
          channelUrl: fullChannelUrl,
          streamUrl: null, // Will be populated later
          type: "sports",
          category: getCategoryFromTitle(title),
          source: baseUrl
        });
        
        console.log(`📺 Found channel: ${title} - ${fullChannelUrl}`);
      }
    });

    console.log(`🔍 Found ${channels.length} channels, now extracting streams...`);

    // Now extract stream URLs from each channel page
    const channelsWithStreams = await Promise.all(
      channels.slice(0, 12).map(async (channel) => {
        try {
          console.log(`🎯 Extracting stream from: ${channel.title}`);
          const streamData = await extractStreamFromChannel(channel.channelUrl, axiosConfig);
          
          return {
            ...channel,
            ...streamData,
            hasStream: !!streamData.streamUrl
          };
        } catch (error) {
          console.log(`❌ Failed to extract stream from ${channel.title}: ${error.message}`);
          return {
            ...channel,
            streamUrl: null,
            iframeUrl: null,
            hasStream: false,
            error: error.message
          };
        }
      })
    );

    console.log(`✅ Successfully processed ${channelsWithStreams.filter(c => c.hasStream).length} streams`);
    return channelsWithStreams;
    
  } catch (error) {
    console.error('❌ Main scraping error:', error.message);
    throw error;
  }
}

async function extractStreamFromChannel(channelUrl, axiosConfig) {
  try {
    console.log(`🔍 Scanning channel: ${channelUrl}`);
    const response = await axios.get(channelUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    
    let streamUrl = null;
    let iframeUrl = null;
    let iframeSrc = null;

    // Look for iframe first (most common)
    $('iframe').each((index, element) => {
      const src = $(element).attr('src');
      if (src && (src.includes('stream') || src.includes('crichd') || src.includes('player'))) {
        iframeSrc = src;
        iframeUrl = src.startsWith('//') ? `https:${src}` : src;
        console.log(`🎯 Found iframe: ${iframeUrl}`);
        return false; // Break loop
      }
    });

    // If iframe found, that's our stream
    if (iframeUrl) {
      streamUrl = iframeUrl;
    } else {
      // Look for video elements
      $('video').each((index, element) => {
        const src = $(element).attr('src');
        if (src && (src.includes('.m3u8') || src.includes('.mp4'))) {
          streamUrl = src;
          console.log(`🎯 Found video source: ${src}`);
          return false;
        }
      });
    }

    // Look for script variables containing stream URLs
    if (!streamUrl) {
      $('script').each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent) {
          const streamMatches = scriptContent.match(/(https?:\/\/[^\s"']*\.m3u8[^\s"']*)/g) ||
                               scriptContent.match(/(https?:\/\/[^\s"']*stream[^\s"']*)/g);
          
          if (streamMatches && streamMatches.length > 0) {
            streamUrl = streamMatches[0];
            console.log(`🎯 Found stream in script: ${streamUrl}`);
            return false;
          }
        }
      });
    }

    return {
      streamUrl: streamUrl,
      iframeUrl: iframeUrl,
      iframeSrc: iframeSrc
    };
    
  } catch (error) {
    console.error(`❌ Error extracting from ${channelUrl}:`, error.message);
    return {
      streamUrl: null,
      iframeUrl: null,
      iframeSrc: null
    };
  }
}

function getCategoryFromTitle(title) {
  if (title.includes('Willow')) return 'USA';
  if (title.includes('Star')) return 'India';
  if (title.includes('T Sports')) return 'Bangladesh';
  if (title.includes('PTV')) return 'Pakistan';
  if (title.includes('Sky')) return 'UK';
  if (title.includes('Fox')) return 'Australia';
  if (title.includes('Super')) return 'South Africa';
  if (title.includes('Ten')) return 'Pakistan';
  if (title.includes('GTV')) return 'Bangladesh';
  if (title.includes('Astra')) return 'Middle East';
  return 'International';
}

function $(element) {
  return cheerio.load(element);
}