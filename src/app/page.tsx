import PredictorClient from './PredictorClient';
import { getPersistedData } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
