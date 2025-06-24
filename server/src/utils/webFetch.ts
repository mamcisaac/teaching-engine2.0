import axios from 'axios';
import { JSDOM } from 'jsdom';
import { createHash } from 'crypto';

interface CacheEntry {
  html: string;
  timestamp: number;
}

export class WebFetch {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly cacheTime = 15 * 60 * 1000; // 15 minutes
  private readonly userAgent = 'Mozilla/5.0 (compatible; TeachingEngine/2.0; +https://teaching-engine.com)';
  
  async fetch(url: string): Promise<string> {
    // Check cache first
    const cacheKey = this.getCacheKey(url);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.html;
    }
    
    try {
      // Fetch with axios
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000, // 30 seconds
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });
      
      const html = response.data;
      
      // Cache the result
      this.cache.set(cacheKey, {
        html,
        timestamp: Date.now()
      });
      
      // Clean old cache entries
      this.cleanCache();
      
      return html;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      
      // Try with JSDOM as fallback for JavaScript-heavy sites
      try {
        const dom = await JSDOM.fromURL(url, {
          userAgent: this.userAgent,
          pretendToBeVisual: true,
          runScripts: 'dangerously',
          resources: 'usable'
        });
        
        // Wait a bit for JavaScript to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const html = dom.serialize();
        
        // Cache the result
        this.cache.set(cacheKey, {
          html,
          timestamp: Date.now()
        });
        
        dom.window.close();
        return html;
      } catch (fallbackError) {
        console.error(`Fallback fetch also failed for ${url}:`, fallbackError);
        throw new Error(`Unable to fetch content from ${url}`);
      }
    }
  }
  
  private getCacheKey(url: string): string {
    return createHash('md5').update(url).digest('hex');
  }
  
  private cleanCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTime) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
  }
  
  // Utility method to extract text content from HTML
  extractText(html: string, selector?: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    if (selector) {
      const element = document.querySelector(selector);
      return element?.textContent?.trim() || '';
    }
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    return document.body?.textContent?.trim() || '';
  }
  
  // Utility method to extract meta information
  extractMeta(html: string): Record<string, string> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const meta: Record<string, string> = {};
    
    // Extract common meta tags
    const metaTags = document.querySelectorAll('meta[name], meta[property]');
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (name && content) {
        meta[name] = content;
      }
    });
    
    // Extract title
    const title = document.querySelector('title');
    if (title) {
      meta.title = title.textContent || '';
    }
    
    return meta;
  }
}