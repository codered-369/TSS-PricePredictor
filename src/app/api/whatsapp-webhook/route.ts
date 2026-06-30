import { NextResponse } from 'next/server';
import { redis } from '@/lib/data';

// Helper function to extract prices from raw text
function parseWhatsAppMessage(text: string) {
  // Extract Date (e.g. 29.06.2026 -> 29-06-26)
  const dateMatch = text.match(/(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})/);
  let dateStr = "";
  if (dateMatch) {
    const d = dateMatch[1].padStart(2, '0');
    const m = dateMatch[2].padStart(2, '0');
    const y = dateMatch[3].slice(-2);
    dateStr = `${d}-${m}-${y}`;
  } else {
    const today = new Date();
    dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(2)}`;
  }

  // Isolate the TSS Sirsi block specifically to avoid Yallapura/Siddapura rates
  const sirsiMatch = text.match(/TSS Sirsi_?\*([\s\S]*?)(\*Total Sales|_TSS Yallapura|_TSS Siddapura)/i);
  const sirsiText = sirsiMatch ? sirsiMatch[1] : text; // Fallback to full text

  // Helper to extract Min, Max, Avg from a line
  const extractNumbers = (regex: RegExp) => {
    const match = sirsiText.match(regex);
    if (match) {
      return { 
        n: parseInt(match[1]) || 0, // Min
        x: parseInt(match[2]) || 0, // Max
        a: parseInt(match[3]) || 0  // Avg
      };
    }
    return { n: 0, x: 0, a: 0 };
  };

  // The raw message has columns: Min, Max, Avg
  const rashi = extractNumbers(/Rashi\s+(\d+)\s+(\d+)\s+(\d+)/i);
  const kempu = extractNumbers(/K\.?G\.?\s+(\d+)\s+(\d+)\s+(\d+)/i);
  const chali = extractNumbers(/Ch\.?\s*K\s+(\d+)\s+(\d+)\s+(\d+)/i);
  const pepper = extractNumbers(/Pepper\s+(\d+)\s+(\d+)\s+(\d+)/i);

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
