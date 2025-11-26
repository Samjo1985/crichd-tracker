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
    console.log('🚀 Starting REAL URL scraping...');
    const channels = await scrapeRealUrls();
    
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({
      success: true,
      data: channels,
      total: channels.length,
      lastUpdated: new Date().toISOString(),
      message: `Found ${channels.filter(c => c.hasStream).length} real streams`
    });
    
  } catch (error) {
    console.error('❌ Real scraping failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Scraping failed',
      details: error.message
    });
  }
}

async function scrapeRealUrls() {
  const baseUrl = 'https://profamouslife.com';
  
  const axiosConfig = {
    timeout: 30000,
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

    // Extract all channels from main page - REAL URLs
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
        
        const channel = {
          id: channels.length + 1,
          title: title,
          icon: fullIconUrl,
          channelUrl: fullChannelUrl,
          streamUrl: null, // Will be filled with REAL URL
          hasStream: false,
          type: "unknown",
          category: getCategoryFromTitle(title),
          quality: "HD",
          source: "profamouslife.com",
          status: "pending"
        };
        
        channels.push(channel);
        console.log(`📺 Found channel: ${title} -> ${fullChannelUrl}`);
      }
    });

    console.log(`🔍 Found ${channels.length} channels, visiting each page...`);

    // Step 2: Visit EVERY channel page and extract REAL iframe src
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      console.log(`\n🎯 Visiting (${i+1}/${channels.length}): ${channel.title}`);
      console.log(`   📄 Page: ${channel.channelUrl}`);
      
      try {
        const realStreamUrl = await getRealStreamUrl(channel.channelUrl, axiosConfig);
        
        if (realStreamUrl) {
          channel.streamUrl = realStreamUrl;
          channel.hasStream = true;
          channel.type = "iframe";
          channel.status = "success";
          console.log(`✅ SUCCESS: Found real stream URL`);
          console.log(`   📺 Real URL: ${realStreamUrl}`);
        } else {
          channel.status = "no_stream";
          console.log(`❌ FAILED: No stream iframe found on the page`);
        }
        
        // Respectful delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        channel.status = "error";
        channel.error = error.message;
        console.log(`🚨 ERROR: ${error.message}`);
      }
    }

    const workingChannels = channels.filter(ch => ch.hasStream);
    console.log(`\n🎉 FINAL RESULTS:`);
    console.log(`   ✅ Working: ${workingChannels.length}`);
    console.log(`   ❌ Failed: ${channels.length - workingChannels.length}`);
    
    // Log all working streams
    workingChannels.forEach(channel => {
      console.log(`   📺 ${channel.title}: ${channel.streamUrl}`);
    });
    
    return workingChannels;
    
  } catch (error) {
    console.error('❌ Main scraping failed:', error.message);
    throw error;
  }
}

async function getRealStreamUrl(channelUrl, config) {
  try {
    console.log(`   🌐 Fetching channel page...`);
    const response = await axios.get(channelUrl, config);
    const $ = cheerio.load(response.data);
    
    // Look for the actual iframe with stream
    let realStreamUrl = null;

    // Method 1: Direct iframe extraction
    $('iframe').each((index, element) => {
      const src = $(element).attr('src');
      console.log(`   🔍 Found iframe: ${src}`);
      
      if (src && isLikelyStreamUrl(src)) {
        realStreamUrl = src.startsWith('//') ? `https:${src}` : src;
        console.log(`   ✅ This looks like a stream!`);
        return false; // Stop searching
      }
    });

    // Method 2: If no iframe found, look for other video elements
    if (!realStreamUrl) {
      $('video').each((index, element) => {
        const src = $(element).attr('src');
        if (src && isLikelyStreamUrl(src)) {
          realStreamUrl = src;
          console.log(`   ✅ Found video source: ${src}`);
          return false;
        }
      });
    }

    // Method 3: Look for embed scripts
    if (!realStreamUrl) {
      $('script').each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent) {
          // Look for common stream URL patterns in scripts
          const patterns = [
            /src\s*=\s*["'](https?:\/\/[^"']*\.php[^"']*)["']/,
            /iframe.*?src\s*=\s*["'](https?:\/\/[^"']*)["']/,
            /["'](https?:\/\/[^"']*streamcrichd[^"']*)["']/,
            /["'](https?:\/\/[^"']*crichd[^"']*)["']/
          ];
          
          for (const pattern of patterns) {
            const match = scriptContent.match(pattern);
            if (match && match[1] && isLikelyStreamUrl(match[1])) {
              realStreamUrl = match[1];
              console.log(`   ✅ Found in script: ${realStreamUrl}`);
              return false;
            }
          }
        }
      });
    }

    return realStreamUrl;
    
  } catch (error) {
    console.log(`   ❌ Failed to fetch page: ${error.message}`);
    return null;
  }
}

function isLikelyStreamUrl(url) {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Must include these keywords
  const mustInclude = ['stream', 'crichd'];
  const hasRequired = mustInclude.some(keyword => lowerUrl.includes(keyword));
  
  if (!hasRequired) return false;
  
  // Should be a PHP file or have common stream patterns
  const goodPatterns = [
    '.php',
    '/update/',
    'streamcrichd',
    'crichd.vip',
    'crichdstreaming'
  ];
  
  return goodPatterns.some(pattern => lowerUrl.includes(pattern));
}

function getCategoryFromTitle(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('willow')) return 'USA';
  if (lowerTitle.includes('star')) return 'India';
  if (lowerTitle.includes('t sports')) return 'Bangladesh';
  if (lowerTitle.includes('ptv')) return 'Pakistan';
  if (lowerTitle.includes('sky')) return 'UK';
  if (lowerTitle.includes('fox')) return 'Australia';
  if (lowerTitle.includes('super')) return 'South Africa';
  if (lowerTitle.includes('ten')) return 'Pakistan';
  if (lowerTitle.includes('gtv')) return 'Bangladesh';
  if (lowerTitle.includes('astra')) return 'Middle East';
  
  return 'International';
}