
import { toast } from "sonner";

interface MetadataResult {
  title: string | null;
  titleOptions: string[];
  description: string | null;
  image: string | null;
}

export async function fetchUrlMetadata(url: string): Promise<MetadataResult> {
  try {
    // Ensure URL has proper protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Use a serverless function or CORS proxy to fetch metadata
    // For client-side, we'll use a public CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error("Failed to fetch URL metadata");
    }
    
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // Get title options (with priority)
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const htmlTitle = doc.querySelector('title')?.textContent;
    const h1Title = doc.querySelector('h1')?.textContent;
    
    // Build title options array (filter out nulls/duplicates)
    const titleOptions = [ogTitle, twitterTitle, htmlTitle, h1Title]
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index) as string[];
    
    // Default title is the first valid option
    const title = titleOptions.length > 0 ? titleOptions[0] : null;
    
    // Get description
    const description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                      doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || 
                      doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
    
    // Get image
    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
                doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || 
                doc.querySelector('link[rel="image_src"]')?.getAttribute('href') || null;
    
    // For YouTube URLs, fix the image URL if needed
    let finalImage = image;
    if (finalImage && !finalImage.startsWith('http')) {
      finalImage = `https:${finalImage}`;
    }
    
    // For YouTube URLs, try to extract the video ID and use the YouTube thumbnail
    if (normalizedUrl.includes('youtube.com/watch') || normalizedUrl.includes('youtu.be/')) {
      let videoId = '';
      if (normalizedUrl.includes('youtube.com/watch')) {
        const url = new URL(normalizedUrl);
        videoId = url.searchParams.get('v') || '';
      } else if (normalizedUrl.includes('youtu.be/')) {
        videoId = normalizedUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      
      if (videoId) {
        finalImage = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return { 
      title, 
      titleOptions, 
      description, 
      image: finalImage 
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    toast.error("Failed to fetch URL metadata");
    return { title: null, titleOptions: [], description: null, image: null };
  }
}
