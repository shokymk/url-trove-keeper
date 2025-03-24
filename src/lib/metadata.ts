
import { toast } from "sonner";

interface MetadataResult {
  title: string | null;
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
    
    // Get title
    let title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || 
                doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || 
                doc.querySelector('title')?.textContent || null;
    
    // Get description
    let description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                      doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || 
                      doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
    
    // Get image
    let image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
                doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || null;
    
    // For YouTube URLs, fix the image URL if needed
    if (image && !image.startsWith('http')) {
      image = `https:${image}`;
    }
    
    return { title, description, image };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    toast.error("Failed to fetch URL metadata");
    return { title: null, description: null, image: null };
  }
}
