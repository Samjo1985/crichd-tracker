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
    console.log('🕸️ Scraping real streams from channel pages...');
    const channels = await scrapeRealStreams();
    
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({
      success: true,
      data: channels,
      total: channels.length,
      lastUpdated: new Date().toISOString(),
      message: `Found ${channels.filter(c => c.hasStream).length} working streams`
    });
    
  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    
    // Minimal fallback
    const fallbackChannels = [
      {
        id: 1,
        title: "Willow Cricket",
        icon: "https://profamouslife.com/icons/willow-sports.png",
        streamUrl: "https://streamcrichd.com/update/willowcricket.php",
        hasStream: true,
        category: "USA",
        quality: "HD"
      }
    ];
    
    res.status(200).json({
      success: true,
      data: fallbackChannels,
      total: fallbackChannels.length,
      lastUpdated: new Date().toISOString(),
      message: "Using fallback data",
      error: error.message
    });
  }
}

async function scrapeRealStreams() {
  const baseUrl = 'https://profamouslife.com';
  
  const axiosConfig = {
    timeout: 20000, // Increased timeout for scraping
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/'
    }
  };

  try {
    console.log('📡 Step 1: Fetching main directory...');
    const mainResponse = await axios.get(baseUrl, axiosConfig);
    const $main = cheerio.load(mainResponse.data);
    
    const channels = [];
    let channelId = 1;

    // Step 1: Extract all channels from main page
    $main('.channel-list .channel a').each((index, element) => {
      const $link = $main(element);
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
          streamUrl: null, // Will be populated by scraping
          hasStream: false,
          type: "unknown",
          category: getCategoryFromTitle(title),
          quality: "HD",
          source: "profamouslife.com",
          status: "pending"
        });
      }
    });

    console.log(`🔍 Found ${channels.length} channels, now scraping streams...`);

    // Step 2: Scrape each channel page for real stream URLs
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      console.log(`🎯 Scraping (${i+1}/${channels.length}): ${channel.title}`);
      
      try {
        const streamData = await scrapeStreamFromChannelPage(channel.channelUrl, axiosConfig);
        
        if (streamData.streamUrl) {
          channel.streamUrl = streamData.streamUrl;
          channel.hasStream = true;
          channel.type = streamData.type;
          channel.status = "success";
          console.log(`✅ Found stream: ${channel.title} -> ${streamData.streamUrl}`);
        } else {
          channel.status = "no_stream";
          console.log(`❌ No stream found: ${channel.title}`);
        }
        
        // Add delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        channel.status = "error";
        channel.error = error.message;
        console.log(`🚨 Error scraping ${channel.title}:`, error.message);
      }
    }

    // Filter only channels with streams
    const channelsWithStreams = channels.filter(channel => channel.hasStream);
    console.log(`🎉 Successfully scraped ${channelsWithStreams.length} working streams`);
    
    return channelsWithStreams;
    
  } catch (error) {
    console.error('❌ Main scraping error:', error.message);
    throw error;
  }
}

async function scrapeStreamFromChannelPage(channelUrl, axiosConfig) {
  try {
    console.log(`   🔍 Scanning: ${channelUrl}`);
    const response = await axios.get(channelUrl, axiosConfig);
    const $ = cheerio.load(response.data);
    
    let streamUrl = null;
    let type = "unknown";

    // Method 1: Look for iframe with stream
    $('iframe').each((index, element) => {
      const src = $(element).attr('src');
      if (src && (src.includes('stream') || src.includes('crichd') || src.includes('player'))) {
        streamUrl = src.startsWith('//') ? `https:${src}` : src;
        type = "iframe";
        console.log(`   ✅ Found iframe: ${streamUrl}`);
        return false; // Break loop
      }
    });

    // Method 2: Look for video elements with m3u8
    if (!streamUrl) {
      $('video').each((index, element) => {
        const src = $(element).attr('src');
        if (src && src.includes('.m3u8')) {
          streamUrl = src;
          type = "m3u8";
          console.log(`   ✅ Found m3u8: ${streamUrl}`);
          return false;
        }
      });
    }

    // Method 3: Look for script variables with stream URLs
    if (!streamUrl) {
      $('script').each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent) {
          // Look for various stream URL patterns
          const patterns = [
            /src\s*:\s*["'](https?:\/\/[^"']*\.m3u8[^"']*)["']/,
            /src\s*=\s*["'](https?:\/\/[^"']*\.m3u8[^"']*)["']/,
            /["'](https?:\/\/[^"']*stream[^"']*\.php[^"']*)["']/,
            /iframe.*src\s*=\s*["'](https?:\/\/[^"']*)["']/,
            /window\.location\s*=\s*["'](https?:\/\/[^"']*)["']/
          ];
          
          for (const pattern of patterns) {
            const match = scriptContent.match(pattern);
            if (match && match[1]) {
              streamUrl = match[1];
              type = "script";
              console.log(`   ✅ Found in script: ${streamUrl}`);
              return false;
            }
          }
        }
      });
    }

    // Method 4: Look for meta refresh or redirects
    if (!streamUrl) {
      $('meta[http-equiv="refresh"]').each((index, element) => {
        const content = $(element).attr('content');
        if (content) {
          const urlMatch = content.match(/url=(.*)/i);
          if (urlMatch && urlMatch[1]) {
            streamUrl = urlMatch[1].trim();
            type = "redirect";
            console.log(`   ✅ Found redirect: ${streamUrl}`);
          }
        }
      });
    }

    return { streamUrl, type };
    
  } catch (error) {
    console.error(`   ❌ Error scraping ${channelUrl}:`, error.message);
    return { streamUrl: null, type: "error" };
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