import { NextResponse } from 'next/server';
import { redis } from '@/lib/data';

// Helper function to extract prices from raw text
function parseWhatsAppMessage(text: string) {
  // We will refine this once we see the exact message format!
  // This is a placeholder parser that looks for numbers near keywords
  
  const extractNumbers = (regex: RegExp) => {
    const match = text.match(regex);
    if (match) {
      // Find all numbers in the matched line
      const nums = match[0].match(/\d{2,5}/g)?.map(Number) || [];
      if (nums.length >= 2) {
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const avg = Math.floor((min + max) / 2);
        return { n: min, x: max, a: avg };
      }
    }
    return { n: 0, x: 0, a: 0 };
  };

  const rashi = extractNumbers(/rashi|Rashi/i);
  const kempu = extractNumbers(/kempu|K\.G/i);
  const chali = extractNumbers(/chali|Ch\.K/i);
  const pepper = extractNumbers(/pepper|Pepper/i);

  // Extract Date (DD-MM-YY)
  const dateMatch = text.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  let dateStr = "";
  if (dateMatch) {
    const d = dateMatch[1].padStart(2, '0');
    const m = dateMatch[2].padStart(2, '0');
    const y = dateMatch[3].slice(-2);
    dateStr = `${d}-${m}-${y}`;
  } else {
    // Fallback to today
    const today = new Date();
    dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(2)}`;
  }

  return {
    d: dateStr,
    rn: rashi.n, ra: rashi.a, rx: rashi.x,
    kn: kempu.n, ka: kempu.a, kx: kempu.x,
    cn: chali.n, ca: chali.a, cx: chali.x,
    pn: pepper.n, pa: pepper.a, px: pepper.x
  };
}

export async function POST(req: Request) {
  try {
    // Twilio sends data as form-urlencoded
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    const sender = params.get('From'); // e.g., whatsapp:+1234567890
    const body = params.get('Body');   // The actual message text

    if (!body) {
      return NextResponse.json({ error: 'No body provided' }, { status: 400 });
    }

    // SECURITY: Ensure ONLY YOU can update the prices
    const ALLOWED_PHONE = process.env.ALLOWED_WHATSAPP_NUMBER; 
    if (ALLOWED_PHONE && sender !== `whatsapp:${ALLOWED_PHONE}`) {
      console.warn(`Unauthorized WhatsApp attempt from ${sender}`);
      return NextResponse.json({ error: 'Unauthorized phone number' }, { status: 403 });
    }

    // 1. Parse the message
    const newEntry = parseWhatsAppMessage(body);

    // 2. Fetch existing data
    let existingData: any[] = [];
    if (redis) {
      const data = await redis.get('tss_price_data');
      if (data && Array.isArray(data)) existingData = data;
    }

    // 3. Update or append
    const index = existingData.findIndex(d => d.d === newEntry.d);
    if (index >= 0) {
      existingData[index] = newEntry; // Overwrite if date exists
    } else {
      existingData.push(newEntry); // Append if new date
    }

    // Sort to keep dates chronological
    existingData.sort((a, b) => {
      const parseD = (s: string) => {
        const [dd, mm, yy] = s.split('-');
        return new Date(`20${yy}-${mm}-${dd}`).getTime();
      };
      return parseD(a.d) - parseD(b.d);
    });

    // 4. Save back to Redis
    if (redis) {
      await redis.set('tss_price_data', JSON.stringify(existingData));
    }

    // 5. Reply to WhatsApp confirming success!
    const twiML = `
      <Response>
        <Message>✅ Magic Success! Prices for ${newEntry.d} updated on the website.</Message>
      </Response>
    `;

    return new NextResponse(twiML, {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    
    // Reply with error message
    const twiML = `
      <Response>
        <Message>❌ Error updating prices: Check the server logs.</Message>
      </Response>
    `;
    return new NextResponse(twiML, {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
