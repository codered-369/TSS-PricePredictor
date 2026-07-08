import PredictorClient from './PredictorClient';
import { getPersistedData } from '@/lib/data';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPersistedData();
  let latestDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  
  if (data && data.length > 0) {
    const latest = data[data.length - 1];
    const [dd, mm, yy] = latest.d.split('-');
    const d = new Date(`20${yy}-${mm}-${dd}`);
    latestDateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  }

  return {
    title: `Arecanut and Pepper Price at TSS Sirsi Today | ${latestDateStr} | Live AI Forecast`,
    description: `Check today's exact, 100% accurate Arecanut and Pepper Price at TSS Sirsi market as of ${latestDateStr}. View live APMC rates, Rashi, Chali, Kempu Gotu, and exclusive AI predictions.`,
    openGraph: {
      title: `Arecanut and Pepper Price at TSS Sirsi Today | ${latestDateStr}`,
      description: `Check today's true TSS Sirsi Arecanut and Pepper prices as of ${latestDateStr}. View 7-day AI predictions for Rashi, Kempu Gotu, Chali, and Pepper.`,
    },
    twitter: {
      title: `Arecanut and Pepper Price at TSS Sirsi Today | ${latestDateStr}`,
      description: `Daily market rates and AI predictions for Sirsi Arecanut farmers as of ${latestDateStr}.`,
    }
  };
}

export default async function Page() {
  const data = await getPersistedData();
  
  let dynamicJsonLd = null;
  if (data && data.length > 0) {
    const latest = data[data.length - 1];
    const [dd, mm, yy] = latest.d.split('-');
    const isoDate = `20${yy}-${mm}-${dd}`;
    
    dynamicJsonLd = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": `TSS Sirsi Arecanut Prices for ${isoDate}`,
      "description": `Live market rates for Rashi, Kempu Gotu, Chali, and Pepper from TSS Sirsi APMC on ${isoDate}.`,
      "url": "https://tss-price-predictor.vercel.app/",
      "sameAs": "https://tss-price-predictor.vercel.app/",
      "dateModified": isoDate,
      "creator": {
        "@type": "Organization",
        "name": "TSS Sirsi Smart Price Predictor"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "variableMeasured": [
        {
          "@type": "PropertyValue",
          "name": "Rashi Arecanut",
          "value": latest.ra,
          "unitText": "INR per Quintal"
        },
        {
          "@type": "PropertyValue",
          "name": "Kempu Gotu Arecanut",
          "value": latest.ka,
          "unitText": "INR per Quintal"
        },
        {
          "@type": "PropertyValue",
          "name": "Chali Kempu Arecanut",
          "value": latest.ca,
          "unitText": "INR per Quintal"
        },
        {
          "@type": "PropertyValue",
          "name": "Black Pepper",
          "value": latest.pa,
          "unitText": "INR per Quintal"
        }
      ]
    };
  }

  return (
    <>
      {dynamicJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dynamicJsonLd) }}
        />
      )}
      <PredictorClient initialData={data} />
    </>
  );
}
