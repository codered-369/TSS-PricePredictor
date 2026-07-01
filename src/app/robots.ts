import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Replace this with your actual Vercel domain or custom domain
  const baseUrl = 'https://tss-price-predictor.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow Google from indexing the API routes
      disallow: ['/api/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
