import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPersistedData, savePersistedData } from '@/lib/data';

async function notifySearchEngines() {
  try {
    const sitemapUrl = encodeURIComponent('https://tss-price-predictor.vercel.app/sitemap.xml');
    await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`, { method: 'GET' }).catch(() => {});
  } catch (err) {
    console.warn('Sitemap ping skipped:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Security Check: Prevent unauthorized users from adding data
    if (process.env.ADMIN_SECRET && body.secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Incorrect Admin Secret' }, { status: 401 });
    }

    const data = await getPersistedData();
    
    // Check if date already exists to overwrite, otherwise append
    const existingIndex = data.findIndex((d: any) => d.d === body.d);
    
    if (existingIndex >= 0) {
      data[existingIndex] = { ...data[existingIndex], ...body };
    } else {
      data.push(body);
    }

    // Ensure it's sorted by date if they add an older date
    data.sort((a: any, b: any) => {
      const [ad, am, ay] = a.d.split('-');
      const [bd, bm, by] = b.d.split('-');
      const dateA = new Date(2000 + parseInt(ay), parseInt(am) - 1, parseInt(ad)).getTime();
      const dateB = new Date(2000 + parseInt(by), parseInt(bm) - 1, parseInt(bd)).getTime();
      return dateA - dateB;
    });

    await savePersistedData(data);

    try {
      revalidatePath('/');
      notifySearchEngines();
    } catch (revalErr) {
      console.warn('Revalidation error:', revalErr);
    }
    
    return NextResponse.json({ success: true, message: 'Data saved and model retrained successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
