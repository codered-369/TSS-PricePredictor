import PredictorClient from './PredictorClient';
import ServerSeoContent from './components/ServerSeoContent';
import { getPersistedData } from '@/lib/data';
import { predict7, predictStats } from '@/lib/ml';
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
    description: `Check today's exact Arecanut and Pepper Price at TSS Sirsi market as of ${latestDateStr}. View live APMC rates for Rashi, Chali, Kempu Gotu, and 7-day AI price forecasts (ಶಿರಸಿ ಅಡಿಕೆ ಮಾರುಕಟ್ಟೆ ದರ).`,
    keywords: [
      "Arecanut and Pepper Price at TSS Sirsi",
      "TSS Sirsi",
      "Arecanut price Sirsi today",
      "Sirsi supari price",
      "TSS market rate",
      "Sirsi APMC arecanut",
      "Sirsi Adike rate",
      "betel nut price Sirsi",
      "Rashi arecanut price",
      "Chali kempu price",
      "Totagars Cooperative Sale Society",
      "kalumenasu price",
      "black pepper price Sirsi",
      "Sirsi adike price",
      "arecanut prediction",
      "tomorrow sirsi adike price",
      "ಶಿರಸಿ ಅಡಿಕೆ ಮಾರುಕಟ್ಟೆ ದರ tss",
      "ಅಡಿಕೆ ಇಂದಿನ ದರ",
      "ಶಿರಸಿ ಟಿಎಸ್ಎಸ್ ಅಡಿಕೆ ಬೆಲೆ"
    ],
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
  
  let datasetSchema = null;
  let faqSchema = null;
  let breadcrumbSchema = null;

  let latestItem: any = null;
  let formattedDate = '';
  
  let rashiForecast = { nextDayPred: 0, trend7Days: [] as number[], slope: 0 };
  let chaliForecast = { nextDayPred: 0, trend7Days: [] as number[], slope: 0 };
  let kempuForecast = { nextDayPred: 0, trend7Days: [] as number[], slope: 0 };
  let pepperForecast = { nextDayPred: 0, trend7Days: [] as number[], slope: 0 };

  if (data && data.length > 0) {
    latestItem = data[data.length - 1];
    const [dd, mm, yy] = latestItem.d.split('-');
    const isoDate = `20${yy}-${mm}-${dd}`;
    const dObj = new Date(isoDate);
    formattedDate = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    // Calculate ML stats for SSR content & Schemas
    const rashiAvgs = data.map(d => d.ra);
    const chaliAvgs = data.map(d => d.ca);
    const kempuAvgs = data.map(d => d.ka);
    const pepperAvgs = data.map(d => d.pa);

    const rashiStats = predictStats(rashiAvgs, 1);
    const chaliStats = predictStats(chaliAvgs, 1);
    const kempuStats = predictStats(kempuAvgs, 1);
    const pepperStats = predictStats(pepperAvgs, 1);

    rashiForecast = { nextDayPred: rashiStats.pred, trend7Days: predict7(rashiAvgs), slope: rashiStats.slope };
    chaliForecast = { nextDayPred: chaliStats.pred, trend7Days: predict7(chaliAvgs), slope: chaliStats.slope };
    kempuForecast = { nextDayPred: kempuStats.pred, trend7Days: predict7(kempuAvgs), slope: kempuStats.slope };
    pepperForecast = { nextDayPred: pepperStats.pred, trend7Days: predict7(pepperAvgs), slope: pepperStats.slope };

    // 1. Dataset Schema
    datasetSchema = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": `TSS Sirsi Arecanut Prices for ${isoDate}`,
      "description": `Official live market rates for Rashi, Kempu Gotu, Chali Arecanut, and Pepper from TSS Sirsi APMC on ${isoDate}.`,
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
          "value": latestItem.ra,
          "unitText": "INR per Quintal"
        },
        {
          "@type": "PropertyValue",
          "name": "Kempu Gotu Arecanut",
          "value": latestItem.ka,
          "unitText": "INR per Quintal"
        },
        {
          "@type": "PropertyValue",
          "name": "Chali Kempu Arecanut",
          "value": latestItem.ca,
          "unitText": "INR per Quintal"
        },
        {
          "@type": "PropertyValue",
          "name": "Black Pepper",
          "value": latestItem.pa,
          "unitText": "INR per Quintal"
        }
      ]
    };

    // 2. FAQ Schema for Rich Snippets
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is today's TSS Sirsi Arecanut Rashi price? (ಶಿರಸಿ ಟಿ.ಎಸ್.ಎಸ್ ಇಂದಿನ ರಾಶಿ ಅಡಿಕೆ ದರ ಎಷ್ಟು?)",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `As of ${formattedDate}, the average Rashi Arecanut price at TSS Sirsi is ₹${latestItem.ra.toLocaleString('en-IN')} per quintal, ranging from a minimum of ₹${latestItem.rn.toLocaleString('en-IN')} to a maximum of ₹${latestItem.rx.toLocaleString('en-IN')}.`
          }
        },
        {
          "@type": "Question",
          "name": "What is the expected tomorrow Sirsi adike price? (ನಾಳೆಯ ಶಿರಸಿ ಅಡಿಕೆ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಏನು?)",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Our machine learning engine predicts tomorrow's average Rashi Arecanut price at TSS Sirsi to be approximately ₹${rashiForecast.nextDayPred.toLocaleString('en-IN')} per quintal based on recent auction trends.`
          }
        },
        {
          "@type": "Question",
          "name": "How frequently are TSS Sirsi market rates updated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TSS Sirsi market rates are updated daily in real-time as soon as the official Totagars' Cooperative Sale Society tender results are declared."
          }
        },
        {
          "@type": "Question",
          "name": "What is today's Black Pepper (Kalumenasu) price at TSS Sirsi? (ಶಿರಸಿ ಕಾಳುಮೆಣಸು ಬೆಲೆ ಎಷ್ಟು?)",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Today's average Black Pepper price at TSS Sirsi is ₹${latestItem.pa.toLocaleString('en-IN')} per quintal (ranging from ₹${latestItem.pn.toLocaleString('en-IN')} min to ₹${latestItem.px.toLocaleString('en-IN')} max).`
          }
        }
      ]
    };

    // 3. Breadcrumb Schema
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://tss-price-predictor.vercel.app/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "TSS Sirsi APMC Rates",
          "item": "https://tss-price-predictor.vercel.app/"
        }
      ]
    };
  }

  return (
    <>
      {datasetSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <PredictorClient initialData={data} />
      <ServerSeoContent
        latest={latestItem}
        formattedDate={formattedDate}
        rashiForecast={rashiForecast}
        chaliForecast={chaliForecast}
        kempuForecast={kempuForecast}
        pepperForecast={pepperForecast}
      />
    </>
  );
}
