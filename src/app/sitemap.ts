import { MetadataRoute } from 'next';
import { getPersistedData } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getPersistedData();
  const baseUrl = 'https://tss-price-predictor.vercel.app';
  
  let lastModified = new Date();
  
  if (data && data.length > 0) {
    const latest = data[data.length - 1];
    const [dd, mm, yy] = latest.d.split('-');
    lastModified = new Date(`20${yy}-${mm}-${dd}T18:00:00Z`); // Assuming data comes in around 6 PM
  }

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
