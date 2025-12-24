
import { ApodData } from '../types';

const NASA_API_KEY = 'KsHi59MzcNF0ahRnjGEQAxcQP92yfGQJdpchdTC4';
const BASE_URL = 'https://api.nasa.gov/planetary/apod';
const LIBRARY_URL = 'https://images-api.nasa.gov/search';

export const nasaService = {
  async getByDate(date: string): Promise<ApodData> {
    const response = await fetch(`${BASE_URL}?api_key=${NASA_API_KEY}&date=${date}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to fetch APOD by date');
    }
    return response.json();
  },

  async getToday(): Promise<ApodData> {
    const response = await fetch(`${BASE_URL}?api_key=${NASA_API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch today's APOD");
    return response.json();
  },

  async getRandom(count: number = 10): Promise<ApodData[]> {
    const response = await fetch(`${BASE_URL}?api_key=${NASA_API_KEY}&count=${count}`);
    if (!response.ok) throw new Error('Failed to fetch random APODs');
    return response.json();
  },

  /**
   * Searches the wider NASA Image Library
   * Maps results back to ApodData format for consistent rendering
   */
  async searchLibrary(query: string): Promise<ApodData[]> {
    const response = await fetch(`${LIBRARY_URL}?q=${encodeURIComponent(query)}&media_type=image`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    
    return data.collection.items.slice(0, 20).map((item: any) => ({
      date: item.data[0].date_created.split('T')[0],
      explanation: item.data[0].description || 'No description available.',
      title: item.data[0].title,
      url: item.links[0].href,
      hdurl: item.links[0].href,
      media_type: 'image',
      service_version: 'v1'
    }));
  },

  getRecentBatch(count: number, offset: number = 0): string[] {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(today.getDate() - (offset + i));
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }
};
